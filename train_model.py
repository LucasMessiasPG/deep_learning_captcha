import tensorflow as tf
import cv2
import numpy as np
from os import listdir
from os.path import isfile, join, splitext
from sklearn.model_selection import train_test_split

def getFile(path):
    img = cv2.imread(path)
    gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    return img, gray, splitext(file)[0]

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

def splitNumbers(name, img, index):
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
    return name[index], img

def getCountours(img):
    img = cv2.bitwise_not(img)

    _, contours,hierarchy = cv2.findContours(img, cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
    cnt = contours[0]
    bb_list = []
    for c in contours:  
        bb = cv2.boundingRect(c)
        if (bb[0] == 0 and bb[1] == 0 and bb[2] == img.shape[1] and bb[3] == img.shape[0]):
            continue
        bb_list.append(bb)
        
    bb_list_2 = []
    for c in bb_list:
        x = c[0]
        y = c[1]
        w = c[2]
        h = c[3]
        if w < 10:
            continue
        if h < 10:
            continue
        bb_list_2.append(c)
        
    bb_list_2.sort(key=lambda x:x[0])
    if len(bb_list_2) == 0:
        return 0,0,0,0
    x_start, _, _, _ = bb_list_2[0]
        
    lastCountours = []
    sumLastCountours = 0;
    for c in bb_list_2:
        if c[0] + c[2] > sumLastCountours:
            sumLastCountours = c[0] + c[2]
            lastCountours = c
    
    x_end, _, w_end, _ = bb_list_2[-1]
    x_end = x_end + w_end;
    
    bb_list.sort(key=lambda y:y[1])
    _, y, _, _ = bb_list[0]

    bb_list.sort(key=lambda y:y[3]) 
    _, _, _, h = bb_list[-1]
    x = x_start;
    w = sumLastCountours - x_start ;
    
    return x,y,w,h

mypath = "./captchas"
files = [f for f in listdir(mypath) if isfile(join(mypath, f))]

x = []
y = []
count = 0
for idx, file in enumerate(files):
    if file == "teste.jpeg":
        continue
        
    if file == ".DS_Store":
        continue
        
    _, gray, label = getFile(mypath+"/"+file)
    gray = cleanUp(gray)
    x_c, y_c, w_c, h_c = getCountours(gray)
    if x_c == 0 and y_c == 0 and w_c == 0 and h_c == 0:
        print(label)
        continue
    crop_img = gray[y_c:y_c+h_c, x_c:x_c+w_c]
    for number in range(4):
        label_number, img_number = splitNumbers(label, crop_img, number)
        x.append(img_number)
        y.append(label_number)
            
x = np.asarray(x)
y = np.asarray(y)

x_train, x_test, y_train, y_test  = train_test_split(x, y, test_size=0.1, random_state=15)
print("x_train: ",len(x_train))
print("y_train: ",len(y_train))
print("x_test: ",len(x_test))
print("y_test: ",len(y_test))


number = 128
model = tf.keras.models.Sequential()
model.add(tf.keras.layers.Flatten(input_shape=x_train.shape[1:]))
for index in range(11):
    model.add(tf.keras.layers.Dense(number, activation=tf.nn.relu))
model.add(tf.keras.layers.Dense(10, activation=tf.nn.softmax))  # our output layer. 10 units for 10 classes. Softmax for probability distribution

model.compile(optimizer='adam',  # Good default optimizer to start with
              loss='sparse_categorical_crossentropy',  # how will we calculate our "error." Neural network aims to minimize loss.
              metrics=['accuracy'])  # what to track

modelFit = model.fit(x_train, y_train, epochs=10)  # train the model

val_loss, val_acc = model.evaluate(x_test, y_test)  # evaluate the out of sample data with model
print(val_loss)  # model's loss (error)
print(val_acc)  # model's accuracy

tf.keras.models.save_model(
    model,
    "./captcha_model.h5",
    overwrite=True,
    include_optimizer=True
)