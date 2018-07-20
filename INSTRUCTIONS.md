# Watson Hands On Labs - Visual Recognition

During this lab, you will use the [Visual Recognition][visual_recognition] service to train a classifier and recognize images.

You can see a version of this app that is already running [here](https://visual-recognition-demo.ng.bluemix.net/).

So let’s get started. The first thing to do is to build out the shell of our application in the IBM Cloud.

## Prerequisites

1. Sign up for an [IBM Cloud account](https://console.bluemix.net/registration/).
1. Download the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview).
1. Create an instance of the Visual Recognition service and get your credentials:
    - Go to the [Visual Recognition](https://console.bluemix.net/catalog/services/visual-recognition) page in the IBM Cloud Catalog.
    - Log in to your IBM Cloud account.
    - Click **Create**.
    - Click **Show** to view the service credentials.
    - Copy the `apikey` value
    - Copy the `url` value.


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

1. Copy the credentials from the prerequisites to the application by creating a `.env` file using this format:

  ```none
  VISUAL_RECOGNITION_IAM_API_KEY=<your-api-key>
  VISUAL_RECOGNITION_URL=<your-url>
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

## Deploying to IBM Cloud as a Cloud Foundry Application

1. Login to IBM Cloud with the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview)

    ```
    ibmcloud login
    ```

1. Target a Cloud Foundry organization and space.

    ```
    ibmcloud target --cf
    ```

1. Edit the *manifest.yml* file. Change the **name** field to something unique.  
  For example, `- name: my-app-name`.
1. Deploy the application

    ```
    ibmcloud app push
    ```

1. View the application online at the app URL.  
For example: https://my-app-name.mybluemix.net

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
