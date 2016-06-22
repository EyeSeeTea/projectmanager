# Project Manager

Web application (Dhis2 App) that simplifies the exchange of data and metadata between different DHIS2 platforms, and other administrative tasks, such as running the analityc process and approving data for aggregated data sets.

DHIS2, a flexible, web-based open source information system to collect and analyze information, is being used by MSF as its HMIS. Health information coming from the projects is the reference point for medical interventions coordination, planning and monitoring and a guarantee for early and effective response in case of emergency.

## Sections

* Data Approval: Replicates the data approval function of DHIS2
* Run Analytics: Replicates the run analytics function
* Import / export Meta-Data (Import / Export Project or Dictionary): Exports all Metadata in the system in the smallest format
* Import / export data: Expors data by selected org. unit and period
* Active / recover user: When a system imports metadata, user's passwords are not included in the exchange files. The Project Manager activates the imported users, which means, assign them a new password

## Configuration

Configure the DHIS url in [the manifest.webapp](manifest.webapp#L20) depending on your DHIS2 server instance:
```
"activities": {
    "dhis":{
    "href":"../dhis/"
    }
  }
```

## Feedback

We’d like to hear your thoughts on the app in general, improvements, new features or any of the technologies being used. Just drop as a line at <a href="hello@eyeseetea.com">hello@eyeseetea.com</a> and let us know! If you prefer, you can also create a new issue on our GitHub repository. Note that you will have to register and be logged in to GitHub to create a new issue.

## License

This app is licensed under GPLv3. Please respect the terms of that license.
