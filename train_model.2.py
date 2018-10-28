import tensorflow as tf
import cv2
import numpy as np
from os import listdir
from os.path import isfile, join, splitext
from sklearn.model_selection import train_test_split


def removePixel(img):
    kernel1 = np.array([[0, 0, 0],
                        [0, 1, 0],
                        [0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 0, 0],
                        [0, 1, 1],
                        [0, 0, 0]], np.uint8)

    hitormiss1 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel2)
    img = cv2.bitwise_and(hitormiss1, hitormiss2)
    return img

def getFile(file):
    img = cv2.imread(join("./captchas/", file),  cv2.IMREAD_GRAYSCALE) # 120x40
    orig = img.copy()
    ret, thresh = cv2.threshold(img, 160, 255, cv2.THRESH_BINARY)
    img = cv2.bitwise_and(thresh, thresh, mask=thresh)
    
    kernel1 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)

    hitormiss1 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel2)
    img = cv2.bitwise_and(hitormiss1, hitormiss2)
    x = 5
    y = 5
    h = 35
    w = 115
    im = img[y:y+h, x:x+w]
    
    ret, mask = cv2.threshold(im, 130, 255, cv2.THRESH_BINARY)
    img = removePixel(mask)
    return splitext(file)[0], img, orig
	
def getFileFullPath(file):
    img = cv2.imread(join(file),  cv2.IMREAD_GRAYSCALE) # 120x40
    orig = img.copy()
    ret, thresh = cv2.threshold(img, 160, 255, cv2.THRESH_BINARY)
    img = cv2.bitwise_and(thresh, thresh, mask=thresh)
    
    kernel1 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)

    hitormiss1 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel2)
    img = cv2.bitwise_and(hitormiss1, hitormiss2)
    x = 5
    y = 5
    h = 35
    w = 115
    im = img[y:y+h, x:x+w]
    
    ret, mask = cv2.threshold(im, 130, 255, cv2.THRESH_BINARY)
    img = removePixel(mask)
    return splitext(file)[0], img, orig

def separetNumbers(name, img, index):
    x = int(0+((img.shape[1]/4)*(index)))
    y = 0
    h = int(img.shape[0])
    w = int(img.shape[1]/4)
    if x < 0:
        x = 0
    if x > 115:
        x = 115
    img = img[y:y+h, x:x+w]
    img = cv2.resize(img, (25, 30))
    ret, img = cv2.threshold(img, 160, 255, cv2.THRESH_BINARY)
    img = cv2.GaussianBlur(img, (5, 5), 1)
    ret, img = cv2.threshold(img, 240, 255, cv2.THRESH_BINARY)
    return name[index], img

def getCountorns(img):
    blur = cv2.GaussianBlur(img, (15, 15), 2)
    kernel1 = np.array([[0, 0, 0],
                        [0, 1, 0],
                        [0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 1, 0],
                        [1, 1, 1],
                        [0, 1, 0]], np.uint8)
    hitormiss1 = cv2.morphologyEx(blur, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(blur, cv2.MORPH_ERODE, kernel2)
    blur = cv2.bitwise_and(hitormiss1, hitormiss2)
    ret, blur = cv2.threshold(blur, 230, 255, cv2.THRESH_BINARY_INV)
    _, contours, _  = cv2.findContours(blur.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

    bb_list = []
    for c in contours:  
        bb = cv2.boundingRect(c)
        # save all boxes except the one that has the exact dimensions of the image (x, y, width, height)
        if (bb[0] == 0 and bb[1] == 0 and bb[2] == img.shape[1] and bb[3] == img.shape[0]):
            continue
        bb_list.append(bb)

    bb_list.sort(key=lambda x:x[0])
    x_start, _, _, _ = bb_list[0]
    x_end, _, w_end, _ = bb_list[-1]

    x = x_start
#     w = (x_end + w_end) - x_start
    w = (x_end + w_end)

    bb_list.sort(key=lambda y:y[1]) # sort by Y value: the first item has the smallest Y value 
    _, y, _, _ = bb_list[0]

    bb_list.sort(key=lambda y:y[3]) # sort by Height value: the last item has the largest Height value 
    _, _, _, h = bb_list[-1]

#     print("x=", x, "y=", y, "w=", w, "h=", h)
    h = 30
    roi_img = img.copy()
    cv2.rectangle(roi_img, (x, y), (x+w, y+h), (0, 0, 255), 1)

    crop_img = img[y:y+h, x:x+w]
    crop_img = cv2.GaussianBlur(crop_img, (3,3),0)
    ret, crop_img = cv2.threshold(crop_img, 240, 255, cv2.THRESH_BINARY)
    return blur, crop_img, roi_img


mypath = "./captchas"
files = [f for f in listdir(mypath) if isfile(join(mypath, f))]

x = []
y = []
count = 0
for idx, file in enumerate(files):
    if file == "teste.jpeg":
        continue
    label, img, original_img = getFile(file)
    img = cv2.bitwise_not(img)
    blur, crop_img, roi_img = getCountorns(img)
    for number in range(4):
        label_number, img_number = separetNumbers(label, crop_img, number)
        x.append(img_number)
        y.append(label_number)
            
        
x = np.asarray(x)
y = np.asarray(y)

x_train, x_test, y_train, y_test  = train_test_split(x, y, test_size=0.2, random_state=15)
print("x_train: ",len(x_train))
print("y_train: ",len(y_train))
print("x_test: ",len(x_test))
print("y_test: ",len(y_test))


number = 128
model = tf.keras.models.Sequential()
model.add(tf.keras.layers.Flatten(input_shape=x_train.shape[1:]))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(10, activation=tf.nn.softmax))  # our output layer. 10 units for 10 classes. Softmax for probability distribution

model.compile(optimizer='adam',  # Good default optimizer to start with
              loss='sparse_categorical_crossentropy',  # how will we calculate our "error." Neural network aims to minimize loss.
              metrics=['accuracy'])  # what to track

modelFit = model.fit(x_train, y_train, epochs=37)  # train the model

tf.keras.models.save_model(
    model,
    "./captcha_model.h5",
    overwrite=True,
    include_optimizer=True
)
