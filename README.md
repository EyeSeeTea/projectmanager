# HMIS Management

Web application (Dhis2 App) that simplifies the exchange of data and metadata between different DHIS2 platforms, and other administrative tasks, such as running the analityc process and approving data for aggregated data sets.

DHIS2, a flexible, web-based open source information system to collect and analyze information, is being used by MSF as its HMIS. Health information coming from the projects is the reference point for medical interventions coordination, planning and monitoring and a guarantee for early and effective response in case of emergency.

## Sections

* Import  Meta-Data: Import metadata mofications
* Import / export data: Manual and automatic
* Import / export individual data.
* Validation: data validation.
* Refresh data: Replicates the run analytics function
* Reset project users' password.
* Available data: show a table with the number of values introduced by orgunit and period.
* Metadata monitor: show a table with the status of each project.

## Build

NPM is used as dependency manager. In order to have all dependencies available you must execute 

```
# npm install
```
in the app directory.

Then build the app with
```
# npm run build-dev     //Development version
# npm run build-prod    //Production version
```
This will create a `/dist` folder with the app.

Then package the content in `/dist` folder to install the app in the DHIS2 instance.

## License

This app is licensed under GPLv3. Please respect the terms of that license.
