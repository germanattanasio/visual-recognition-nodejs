<h1 align="center" style="border-bottom: none;">🚀 Visual Recognition Sample Application</h1>
<h3 align="center">This Node.js app demonstrates some of the Visual Recognition service features.</h3>
<p align="center">
  <a href="http://travis-ci.org/watson-developer-cloud/visual-recognition-nodejs">
    <img alt="Travis" src="https://travis-ci.org/watson-developer-cloud/visual-recognition-nodejs.svg?branch=master">
  </a>
  <a href="#badge">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
</p>
</p>

The [Visual Recognition][visual_recognition_service] Service uses deep learning algorithms to analyze images for scenes, objects, faces, text, and other subjects that can give you insights into your visual content. You can organize image libraries, understand an individual image, and create custom classifiers for specific results that are tailored to your needs.

## Prerequisites

1. Sign up for an [IBM Cloud account](https://console.bluemix.net/registration/).
1. Download the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview).
1. Create an instance of the Visual Recognition service and get your credentials:
    - Go to the [Visual Recognition](https://console.bluemix.net/catalog/services/visual-recognition) page in the IBM Cloud Catalog.
    - Log in to your IBM Cloud account.
    - Click **Create**.
    - Click **Show** to view the service credentials.
    - Copy the `apikey` value.
    - Copy the `url` value.

## Configuring the application

1. In the application folder, copy the *.env.example* file and create a file called *.env*

    ```
    cp .env.example .env
    ```

2. Open the *.env* file and add the service credentials that you obtained in the previous step.

    Example *.env* file that configures the `apikey` and `url` for a Visual Recognition service instance hosted in the US East region:

    ```
    VISUAL_RECOGNITION_IAM_APIKEY=X4rbi8vwZmKpXfowaS3GAsA7vdy17Qh7km5D6EzKLHL2
    VISUAL_RECOGNITION_URL=https://gateway.watsonplatform.net/visual-recognition/api
    ```

## Running locally

1. Install the dependencies

    ```
    npm install
    ```

1. Run the application

    ```
    npm start
    ```

1. View the application in a browser at `localhost:3000`

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


## Environment Variables

  - `VISUAL_RECOGNITION_IAM_API_KEY` : This is the IAM API key for the vision service, used if you don't have one in your IBM Cloud account.
  - `PRESERVE_CLASSIFIERS` : Set if you don't want classifiers to be deleted after one hour. *(optional)*
  - `PORT` : The port the server should run on. *(optional, defaults to 3000)*
  - `OVERRIDE_CLASSIFIER_ID` : Set to a classifer ID if you want to always use a custom classifier. This classifier will be used instead of training a new one. *(optional)*

## Changing the Included Images

### Sample Images

The sample images are the first 7 images when the site loads.  They
are called from a Jade mixin found in
`views/mixins/sampleImages.jade`.  If you just want to replace those
images with different images, you can replace them in
`public/images/samples` and they are numbered 1 - 7 and are `jpg`
formatted.

### Custom Classifier Bundles

Adding new/different custom classifer bundles is much more invovled.
You can follow the template of the existing bundles found in
`views/includes/train.jade`.

Or, you can train a custom classifier using the api or the form and
then use the classifier ID.

## Getting the Classifier ID

When you train a custom classifier, the name of the classifier is
displayed in the test form.

![Classifier ID Tooltip](screengrab-tooltip.png)

If you hover your mouse over the classifier name, the classifier ID
will be shown in the tooltip. You can also click on the name, and it
will toggle between the classifier name and the classifier ID.

You can then use this custom classifier id by placing it after the hash
in the request URL.  For example, lets say you are running the system
locally, so the base URL is `http://localhost:3000` and then you train
a classifier.  This newly trained classifier might have an id like
`SatelliteImagery_859438478`.   If you wanted to use this classifier
instead of training a new one, you can navigate to
`http://localhost:3000/train#SatelliteImagery_859438478` and use the
training form with your existing classifier.

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).

## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/).


[service_url]: https://www.ibm.com/watson/services/visual-recognition/
[visual_recognition_service]: https://www.ibm.com/watson/services/visual-recognition/
