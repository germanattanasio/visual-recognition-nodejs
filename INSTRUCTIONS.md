# Watson Hands On Labs - Visual Recognition

During this lab, you will use the [Visual Recognition][visual_recognition] service to train a classifier and recognize images.

You can see a version of this app that is already running [here](https://visual-recognition-demo.ng.bluemix.net/).

So let’s get started. The first thing to do is to build out the shell of our application in the IBM Cloud.

## Creating an [IBM Cloud][bluemix] Account

1. Go to https://bluemix.net/
2. Create an IBM Cloud account if required.
3. Log in with your IBM ID (the ID used to create your IBM Cloud account)

**Note:** The confirmation email from the IBM Cloud mail take up to 1 hour.

## Deploy this sample application in the IBM Cloud

1. Clone the repository into your computer and navigate to the new directory.

   ```none
   git clone https://github.com/watson-developer-cloud/visual-recognition-nodejs.git
   cd visual-recognition-nodejs
   ```

1. [Sign up][sign_up] in the IBM Cloud or use an existing account.
1. If it is not already installed on your system, download and install the [Cloud-foundry CLI][cloud_foundry] tool.
1. Edit the `manifest.yml` file in the folder that contains your code and replace `visual-recognition` with a unique name for your application. The name that you specify determines the application's URL, such as `your-application-name.mybluemix.net`. The relevant portion of the `manifest.yml` file looks like the following:

    ```yml
    applications:
    - name: visual-recognition-demo
     command: npm start
     path: .
     memory: 512M
     env:
      NODE_ENV: production
    ```

1. Connect to the IBM Cloud by running the following commands in a terminal window:

  ```none
  cf api https://api.ng.bluemix.net
  cf login
  ```

1. Create and retrieve service keys to access the [Visual Recognition][visual_recognition] service by running the following command:

  ```none
  cf create-service watson_vision_combined free visual-recognition-service
  cf create-service-key visual-recognition-service myKey
  cf service-key visual-recognition-service myKey
  ```

1. Provide the credentials from step 6 to the application by creating a `.env` file using this format:

  ```none
  VISUAL_RECOGNITION_API_KEY=<your-alchemy-api-key>
  ```

1. Install the dependencies you application need:

  ```none
  npm install
  ```

1. Start the application by running:

  ```none
  npm start
  ```

1. Test your application locally by going to: [http://localhost:3000/](http://localhost:3000/)

## Deploying your application to the IBM Cloud

1. Push the updated application live by running the following command:

  ```none
  cf push
  ```

After completing the steps above, you are ready to test your application. Start a browser and enter the URL of your application.

                  <your-application-name>.mybluemix.net

You can also find your application name when you click on your application in the IBM Cloud.

## Classifying Images in the Starter Application

The application is composed of two sections, a "Try" section and a "Train" section. The Try section will allow you to send an individual image to the Visual Recognition service to be classified.

Test out the existing service by selecting one of the provided images or pasting a URL for an image of your choice. You will see the service respond with a collection of recognized attributes about the image.

Next, try running the following image through the classifier by pasting the URL into the "Try" panel.

 * Fruitbowl: https://github.com/watson-developer-cloud/doc-tutorial-downloads/raw/master/visual-recognition/fruitbowl.jpg

You'll see that it's recognized some general attributes about the image, but we want it to be able to specifically recognize it as a **fruitbowl**. To do that, we will need to train a customer classifier.

## Training a Custom Classifier in the Starter App

Navigate over to the "Train" window in the application.

Here, you will see a collection of training sets that have been provided for you. If you select any one of these, you will see that set expand to show a series of classes that will be trained, as well as negative examples of that group. For example, the `Dog Breeds` classifier contains 4 classes of dogs to be identified, as well as a negative example data set of `Non-dogs`.

To train the service to specifically classify a fruitbowl, we are going to use two collections of images to teach Watson what to recognize when classifying a fruitbowl. Click on the "Use your Own" box, and afterward a series of boxes will appear to allow you to upload .zip files for the classes.

Download and select the following .zip files for the classifier:

 * Positive Class #1 (leftmost box) - [fruitbowl.zip](https://github.com/watson-developer-cloud/visual-recognition-nodejs/releases/download/v3.0.0/fruitbowl.zip)
 * Negative Class   (rightmost box) - [not-fruit-bowls.zip](https://github.com/watson-developer-cloud/visual-recognition-nodejs/releases/download/v3.0.0/not-fruit-bowls.zip)

Once the two zip files are included, name the classifier "fruitbowl" and select the "Train your classifier" button

The classifier may take a couple minutes to train, and once it is complete the application will update to allow you to submit new images against that classifier. If you submit the original image that we used in the new prompt on the "Train" window, you will see that it will be specifically classified based on our new training!

# Congratulations

You have completed the Visual Recognition Lab! :bowtie:

 ![Congratulations](http://i.giphy.com/ENagATV1Gr9eg.gif)

[sign_up]: https://bluemix.net/registration
[bluemix]: https://console.bluemix.net/
[wdc_services]: https://www.ibm.com/watson/products-services/
[visual_recognition]: https://console.bluemix.net/docs/services/visual-recognition/index.html#about
[cloud_foundry]: https://github.com/cloudfoundry/cli
