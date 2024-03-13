// migrations/migration_script.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGO_ADDRESS);

const db = mongoose.connection;
db.once('open', async () => {
    try {
        // Get a list of all files in the models directory
        const modelsDir = path.join(__dirname, '..', 'models');
        console.log("TCL: modelsDir", modelsDir)
        const modelFiles = fs.readdirSync(modelsDir);
        console.log("TCL: modelFiles", modelFiles)

        // Iterate over each model file
        for (const modelFile of modelFiles) {
            // Check if the file is a JavaScript file
            if (modelFile.endsWith('.js')) {
                // Dynamically load the model file
                const modelPath = path.join(modelsDir, modelFile);
                const modelName = path.basename(modelFile, '.js');
                const Model = require(modelPath);
                console.log("TCL: Model", Model)

                // Check if the model has a corresponding collection in the database
                const collectionName = Model.collection.name;
                console.log("TCL: collectionName", collectionName)
                const collectionExists = await db.db.listCollections({ name: collectionName }).hasNext();

                console.log("TCL: collectionExists", collectionExists)
                // If the collection exists, perform migration tasks
                if (!collectionExists) {
                    // Perform migration tasks for the current collection
                    // For example, add a new field to all documents in the collection
                    await Model.updateMany({}, { $set: { newField: 'defaultValue' } });
                    console.log(`Migration completed successfully for ${modelName}`);
                }
            }
        }

        console.log('All migrations completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
});
