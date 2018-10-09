import numpy as np
from keras_vggface import VGGFace
from keras.preprocessing import image
from keras_vggface import utils
from keras import Model
from keras.layers import Flatten, Dense, Input, GlobalAveragePooling2D, \
    GlobalMaxPooling2D, Activation, Conv2D, MaxPooling2D, BatchNormalization, \
    AveragePooling2D, Reshape, Permute, multiply
from keras_applications.imagenet_utils import _obtain_input_shape
from keras.utils import layer_utils
from keras.utils.data_utils import get_file
from keras import backend as K
from keras import layers
####  OPEN FACE DEPENDENCIES
import time
import argparse
import cv2
import os
import pickle
from operator import itemgetter
import numpy as np
np.set_printoptions(precision=2)
import pandas as pd
import openface
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC

#parser.add_argument('imgs', type=str, nargs='+', help="Input images.")
#parser.add_argument('--verbose', action='store_true')

fileDir = os.path.dirname(os.path.realpath(__file__))
modelDir = os.path.join(fileDir, '..', 'models')
dlibModelDir = os.path.join(modelDir, 'dlib')
openfaceModelDir = os.path.join(modelDir, 'openface')
align = openface.AlignDlib(os.path.join(dlibModelDir, "shape_predictor_68_face_landmarks.dat"))
net = openface.TorchNeuralNet(os.path.join(openfaceModelDir, 'nn4.small2.v1.t7'), 96)

def get_classification_face_match(target_image):
    nb_class = 2
    hidden_dim = 512
    vggmodel = VGGFace(include_top=False, input_shape=(224, 224, 3))
    last_layer = vggmodel.get_layer('pool5').output
    x = Flatten(name='flatten')(last_layer)
    x = Dense(hidden_dim, activation='relu', name='fc6')(x)
    x = Dense(hidden_dim, activation='relu', name='fc7')(x)
    out = Dense(nb_class, activation='softmax', name='fc8')(x)
    identity_model = Model(vggmodel.input, out)
    ## Train the model
    ##Predict
    img = image.load_img(target_image, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = utils.preprocess_input(x, version=1)
    preds = identity_model.predict(x)
    print ('\n', "VGG16")
    print('\n',preds)
    print('\n','Predicted:', utils.decode_predictions(preds))
    return utils.decode_predictions(preds)[0][0][0]



def getFaceFeaturesRepresentation(imgPath):
    print("Processing {}.".format(imgPath))
    bgrImg = cv2.imread(imgPath)
    if bgrImg is None:
        raise Exception("Unable to load image: {}".format(imgPath))
    rgbImg = cv2.cvtColor(bgrImg, cv2.COLOR_BGR2RGB)

    print("  + Original size: {}".format(rgbImg.shape))

    start = time.time()
    bb = align.getLargestFaceBoundingBox(rgbImg)
    if bb is None:
        raise Exception("Unable to find a face: {}".format(imgPath))
    print("  + Face detection took {} seconds.".format(time.time() - start))

    start = time.time()
    alignedFace = align.align(96, rgbImg, bb,
                              landmarkIndices=openface.AlignDlib.OUTER_EYES_AND_NOSE)
    if alignedFace is None:
        raise Exception("Unable to align image: {}".format(imgPath))
    print("  + Face alignment took {} seconds.".format(time.time() - start))

    start = time.time()
    rep = net.forward(alignedFace)
    print("  + OpenFace forward pass took {} seconds.".format(time.time() - start))
    print("Representation:")
    print(rep)
    print("-----\n")
    return rep


