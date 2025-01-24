import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process'
import { stderr, stdout } from 'process';
import { error, log } from 'console';
import { fileURLToPath } from 'url';
import { ChildProcess } from 'child_process';
import path from 'path';
let app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const codeFolder = path.join(__dirname, 'code');
let port = 4000;
app.use(bodyParser.json());
app.use(cors());
app.post("/execute", (req, res) => {
    const { language, encoded, userInput } = req.body;
    const decodedCode = Buffer.from(encoded, 'base64').toString('utf-8');
    let code = decodedCode;

    let filename = "Main." + language
    const runJavaScriptCode = () => {
        const filePath = path.join(codeFolder, filename);
        if (!fs.existsSync(codeFolder)) {
            fs.mkdirSync(codeFolder, { recursive: true });
        }
        fs.writeFileSync(filePath, code, 'utf-8');
        let command = "";
        if (language == 'js') {
            command += 'node';
        }
        command += " " + filePath;
        exec(command, (error, stdout, stderr) => {
            fs.unlinkSync(filePath);
            if (error) {
                res.send({ satus: "Failed", error: stderr });
            } else {
                res.send({ satus: "Sucess", output: stdout });
            }
        })
    }

    const runJavaCode = async () => {
        const filePath = path.join(codeFolder, filename);
        const filePath2 = path.join(codeFolder, "Main.class")
        if (!fs.existsSync(codeFolder)) {
            fs.mkdirSync(codeFolder, { recursive: true });
        }
        await fs.writeFileSync(filePath, code, 'utf-8');
        let command = "";
        if (language == 'java') {
            command += 'javac';
        }
        command += " " + "code/" + filename;
        console.log(code)
        exec(command, (error, stdout, stderr) => {
            fs.unlinkSync(filePath);
            if (error) {
                res.send({ satus: "Failed", error: stderr, output: stderr });

            } else {
                const command2 = "java code.Main"
                const userCode = exec(command2, (error, stdout2, stderr2) => {
                    fs.unlinkSync(filePath2);
                    if (error) {
                        res.send({ satus: "Failed", error: stderr2, output: stderr2 });
                    } else {
                        res.send({ satus: "Sucess", output: stdout2 });
                    }

                })

                if (userInput) {
                    let inputs = JSON.parse(userInput);
                    for (let i = 0; i < inputs.length; i++) {
                        console.log(inputs[i]);
                        userCode.stdin.write(inputs[i].toString() + "\n");

                    }
                    userCode.stdin.end();
                }
            }
        })


    }

    if (language == 'js') {
        runJavaScriptCode();
    }

    if (language == 'java') {
        runJavaCode();
    }

})

app.listen(port, () => {
    console.log("Listenting at port 4000");

})