# Google Bigquery Schema - Continuous deployment

Working attempt of schema deployment for Google Bigquery. 

In this repository you can find a working github actions flow that is able to deploy Bigquery schema to a GCP project.

In practice, any type of SQL - Data definition language (DDL) or otherwise - could be ran using this method, but there's a special effort here to be able to run python scripts given that at the moment Bigquery does not support the creation of Dataset's via DDL. Hopefully soon.
If Bigquery enables creation of Datasets via DDL, I will happely remove the ability of running python sripts to have a unique language to change the structure of Bigquery: SQL.

## How to setup
1. In the repository secrets you need to add a secret with the name `GOOGLE_CLOUD_CREDENTIALS` and in the Value, the JSON body of the content of a service account credential with Admin permissions to bigquery. The default projectId that will be passed to the queries, is the one in this service account.

![github secrets](/readme/secrets.png "github secrets")

2. Fork this repository and do your changes. 

## What do you need to know 

* In the `Business` folder of this repository you will find a python file `0000 - Create Dataset.py` that contais the instructions to create the dataset if it doesn't exist. Copy and modify the datasetId, also the location where this dataset is supposed to be. For Bigquery, ommission means `US`.
* Also in the in the `Business` folder of this repository you will also find the file `0001 - Customers.bqsql` where the DDL statements should be placed. 
* Create as many `.bqsql` files as needed but be sure that you follow the file naming convention.

## __Important__
* All scripts must be idempotent.
* The order of the files actually matter. The scripts will be executed in that order. Always use a fixed lenght number in the begining of the file name `000` or `0000`.

## Needs improvement
* The python script in `.github/workflows/deploy.py` has the dataset [location](https://github.com/DamiaoCastro/bigquery-schema-deployment-prototype/blob/main/.github/workflows/deploy.py#L36) `'EU'` defined. This might not be your need. As soon as possible I will try to plan a solution for this. Probably by replacing the python script dataset creator for a json file to describe the dataset information. A file named `dataset.json` that will contain the non output-only parts of the dataset insert web API payload.
https://cloud.google.com/bigquery/docs/reference/rest/v2/datasets#Dataset

For example:
```json
{
  "access": [],
  "datasetReference": {
    "datasetId": "MyDatasetName"
  },
  "location": "EU",
  "friendlyName": "my cool dataset",
  "description": "this is where the magic happens",
  "labels": {
    "label1": "two"
  }
}
```


* Support of multiple branches - one for production, another for test, to begin - which implies multiple service account keys and modify the deployment script to be branch aware.

