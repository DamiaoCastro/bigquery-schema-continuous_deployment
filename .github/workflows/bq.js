const { readdirSync, readFileSync } = require('fs')
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const dryRun = process.argv.filter(e => e.toLowerCase() === 'dryrun').length === 1;
const staging = process.argv.filter(e => e.toLowerCase() === 'staging').length === 1;
const production = process.argv.filter(e => e.toLowerCase() === 'production').length === 1;

//validate input
console.log(`dryRun: ${dryRun}`);
console.log(`staging: ${staging}`);
console.log(`production: ${production}`);

const t1 = dryRun && !staging && !production;
const t2 = !dryRun && staging && !production;
const t3 = !dryRun && !staging && production;
if ((true << t1 << t2 << t3) !== 2) { throw Error("You need to specify 'DryRun' or 'Staging' or 'Production' for running the scripts."); }

//check if directory contains the file dataset.json
const containsDatasetFile = path =>
    readdirSync(path, { withFileTypes: true })
        .filter(dirent => dirent.name.toLowerCase() === 'dataset.json')
        .length === 1
    ;

function getDatasetFile(path) {

    const ds = JSON.parse(readFileSync(`${path}/dataset.json`, 'utf8'));

    //validations

    return ds;
}

//list directories
const getDirectories = path =>
    readdirSync(path, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        //if name of the directory starts with dot, it will be ignored
        .filter(dirent => !dirent.name.startsWith('.'))
        .filter(dirent => containsDatasetFile(dirent.name))
        .map(dirent => dirent.name)
    ;
//get *.bqsql file names
const getBqsqlFilesNames = path =>
    readdirSync(path, { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory())
        .filter(dirent => dirent.name.toLowerCase().endsWith('.bqsql'))
        .map(dirent => dirent.name)
        .sort()
    ;

async function executeQuery(path, location) {

    console.log(`file: ${path}`);

    const fileContent = readFileSync(path, 'utf8');

    const r = await bigquery.createQueryJob({
        query: fileContent,
        location: location,
        dryRun: this.dryRun,
        useLegacySql: false
    });

}

async function executeQueriesInDirectory(path) {

    console.log(`directory: ${path}`);

    const ds = getDatasetFile(path);

    //dataset.json
    if (!dryRun) {
        const dataset = bigquery.dataset(ds.id, ds);

        const exists = (await dataset.exists())[0];
        if (exists) {
            const response = await dataset.setMetadata(ds);
            console.log(`dataset ${ds.id} updated if changed`);
        } else {
            const response = await dataset.create();
            console.log(`dataset ${ds.id} created`);
        }
    }

    //*.bqsql
    getBqsqlFilesNames(path).forEach(async e => {
        await executeQuery(`./${path}/${e}`, ds.location);
    });

}

getDirectories('./').forEach(path => { executeQueriesInDirectory(path); });