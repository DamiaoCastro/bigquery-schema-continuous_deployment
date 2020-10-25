import os
from google.cloud import bigquery
import time

def getListOfFiles(dirName):
    # create a list of file and sub directories 
    # names in the given directory 
    listOfFile = os.listdir(dirName)
    allFiles = list()
    # Iterate over all the entries
    for entry in listOfFile:
        # Create full path
        fullPath = os.path.join(dirName, entry)
        # If entry is a directory then get the list of files in this directory 
        if os.path.isdir(fullPath):
            if not entry.startswith('.'):
                allFiles = allFiles + getListOfFiles(fullPath)
        else:
            if entry.lower().endswith('.py') or entry.lower().endswith('.bqsql'):
                allFiles.append(fullPath)
                
    return allFiles 

basePath = './'
client = bigquery.Client()

for item in getListOfFiles(basePath):
    print('execute file content from {}'.format(item))

    if item.lower().endswith('.py'):
        exec(open(item).read()) 

    if item.lower().endswith('.bqsql'):
        with open(item, 'r') as file:
            file_content = file.read()            
            result = client.query(file_content, location = 'EU') # to be fixed as soon as possible, needs to be configurable
            job_id = result.job_id
            #needs to wait until the job is done until it can move to the next one
            while result.state == 'RUNNING':
                time.sleep(3)
                result = client.get_job(job_id)
            
            if result.state == 'ERROR' or (result.error_result is not None and result.error_result.count() > 0):
                raise Exception('Failed to execute query: {}'.format(result.error_result))

            if result.state == 'DONE':
                print('Executed query successfully')

