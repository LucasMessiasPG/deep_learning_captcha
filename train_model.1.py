import tensorflow as tf
import cv2
import matplotlib.pyplot as plt
import numpy as np
from os import listdir
from os.path import isfile, join, splitext
from sklearn.model_selection import train_test_split

def getFile(path):
    img = cv2.imread(path)
    gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    return img, gray

def cleanUp(img):
    kernel = np.ones((2,2),np.uint8)
    opening = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)
    
    closing = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)
    
    img = cv2.bitwise_and(opening, closing)
    
    kernel = np.ones((3,3),np.uint8)
    dilation = cv2.dilate(opening,kernel,iterations = 1)
    
    kernel = np.ones((3,3),np.uint8)
    erosion = cv2.erode(dilation,kernel,iterations = 1)
    
    ret, img = cv2.threshold(erosion, 170, 255, cv2.THRESH_BINARY)
    
    return img

_, img = getFile("captchas/1326.jpg")
img = cleanUp(img)
