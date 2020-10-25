from google.cloud import bigquery
from google.cloud.exceptions import NotFound


dataset_id = 'Business'
location = 'EU'


client = bigquery.Client()

#https://cloud.google.com/bigquery/docs/samples/bigquery-dataset-exists
try:
    client.get_dataset(dataset_id)
    print("Dataset {} already exists".format(dataset_id))

except NotFound:    
    
    #https://cloud.google.com/bigquery/docs/samples/bigquery-create-dataset
    fullDatasetId = "{}.{}".format(client.project, dataset_id)

    dataset = bigquery.Dataset(fullDatasetId)
    dataset.location = location

    dataset = client.create_dataset(dataset, timeout=30)
    print("Created dataset {}".format(dataset_id))
