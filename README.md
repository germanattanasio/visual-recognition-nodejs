# Visual Recognition Demo
[![Build Status](https://travis-ci.org/watson-developer-cloud/visual-recognition-nodejs.svg?branch=master)](https://travis-ci.org/watson-developer-cloud/visual-recognition-nodejs?branch=master)
[![codecov.io](https://codecov.io/github/watson-developer-cloud/visual-recognition-nodejs/coverage.svg?branch=master)](https://codecov.io/github/watson-developer-cloud/visual-recognition-nodejs?branch=master)

The [Visual Recognition][visual_recognition_service] Service uses deep learning algorithms to analyze images for scenes, objects, faces, text, and other subjects that can give you insights into your visual content. You can organize image libraries, understand an individual image, and create custom classifiers for specific results that are tailored to your needs.

Give it a try! Click the button below to fork into IBM DevOps Services and deploy your own copy of this application on Bluemix.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/watson-developer-cloud/visual-recognition-nodejs)

## Getting Started

1. Create a Bluemix Account:

  [Sign up][sign_up] in Bluemix, or use an existing account.

2. Download and install the [Cloud-foundry CLI][cloud_foundry] tool

3. Edit the `manifest.yml` file, and change the `<application-name>` to something unique.
  ```none
applications:
- services:
  - visual-recognition-service
  name: <application-name>
  command: node app.js
  path: .
  memory: 512M
  ```
  The name you use determines your initial application URL, e.g. `<application-name>.mybluemix.net`.

4. Connect to Bluemix in the command line tool
  ```sh
  $ cf api https://api.ng.bluemix.net
  $ cf login -u <your user ID>
  ```

5. Create the Visual Recognition service in Bluemix
  ```sh
  $ cf create-service visual_recognition free visual-recognition-service
  ```

7. Push it live!
  ```sh
  $ cf push
  ```

See the full [API Reference](http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/visual-recognition/api/v3/) documentation for more details, including code snippets and references.

## Running locally
  The application uses [Node.js](http://nodejs.org) and [npm](https://www.npmjs.com) so you will have to download and install them as part of the steps below.

1. Copy the credentials from your `visual-recognition-service` service in Bluemix to `app.js`, you can see the credentials using:

    ```sh
    $ cf env <application-name>
    ```
    Example output:
    ```sh
    System-Provided:
    {
    "VCAP_SERVICES": {
      "visual_recognition": [{
          "credentials": {
            "url": "<url>",
            "password": "<password>",
            "username": "<username>"
          },
        "label": "visual_recognition",
        "name": "visual-recognition-service",
        "plan": "free"
     }]
    }
    }
    ```

    You need to copy `username`, `password` and `url`.

2. Install [Node.js](http://nodejs.org/)
3. Go to the project folder in a terminal and run:
    `npm install`
4. Start the application
5.  `npm start`
6. Go to `http://localhost:3000`

## Troubleshooting

To view your logs and troubleshoot your Bluemix application, run:

  ```sh
  $ cf logs <application-name> --recent
  ```

## License

  This sample code is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).

## Contributing

  See [CONTRIBUTING](CONTRIBUTING.md).

## Open Source @ IBM
  Find more open source projects on the [IBM Github Page](http://ibm.github.io/)

### Privacy Notice

This node sample web application includes code to track deployments to Bluemix and other Cloud Foundry platforms. The following information is sent to a [Deployment Tracker][deploy_track_url] service on each deployment:

* Application Name (`application_name`)
* Space ID (`space_id`)
* Application Version (`application_version`)
* Application URIs (`application_uris`)

This data is collected from the `VCAP_APPLICATION` environment variable in IBM Bluemix and other Cloud Foundry platforms. This data is used by IBM to track metrics around deployments of sample applications to IBM Bluemix. Only deployments of sample applications that include code to ping the Deployment Tracker service will be tracked.

### Disabling Deployment Tracking

Deployment tracking can be disabled by removing `require('cf-deployment-tracker-client').track();` from the beginning of the `server.js` file at the root of this repo.

[deploy_track_url]: https://github.com/cloudant-labs/deployment-tracker
[service_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/visual-recognition.html
[cloud_foundry]: https://github.com/cloudfoundry/cli
[visual_recognition_service]: https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/visual-recognition.html
[sign_up]: https://console.ng.bluemix.net/registration/
[getting_started]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/getting_started/
