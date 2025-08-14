const express = require('express');
const app = express();
const dbo = require('./db');
const chalk = require('chalk');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
function showMenu(){
    console.log();
    console.log(chalk.cyanBright("1. REGISTER"));
    console.log(chalk.cyanBright("2. LOGIN"));
    console.log(chalk.cyanBright("3. DELETE"));
    console.log(chalk.cyanBright("4. SHOW USERS"));
    console.log(chalk.cyanBright("5. EXIT"));
    console.log();
   rl.question(chalk.yellow("Enter the options : "), (choices) => {
    switch (choices) {
        case '1':
            register();
            break;

        case '2':
            login();
            break;

        case '3':
            deletes();
            break;

        case '4':
            display();
            break;
        
        case '5':
            console.log(chalk.greenBright("Exited...✅"));
            rl.close();
            break;
    
        default:
            console.log(chalk.redBright("Please Enter Valid option..❌"));
            showMenu();
            
    }
   })
}

async function deletes(){
    const db = await dbo.DB();
    const collection = db.collection('employees');

    rl.question(chalk.yellow("Enter the name : "),async (names) => {
        rl.question(chalk.yellow("Enter the password : "),async (pass) => {
        const dlt = {NAME : names , PASSWORD : pass};

        const result = await collection.deleteOne(dlt);
        if(!(result.deletedCount===0)){
            console.log(chalk.greenBright("DELETED SUCCESSFULLY...✅"))
            showMenu();
        }
        else{
            console.log(chalk.redBright("DELETETION FAILED...❌"));
            showMenu();
        }
    })
    })
}


async function account(){
    console.log();
    console.log(chalk.cyanBright("1. DEPOSIT"));
    console.log(chalk.cyanBright("2. WITHDRAW"));
    console.log(chalk.cyanBright("3. VIEW BALANCE"));
    console.log(chalk.cyanBright("4. CHANGE PASSWORD"));
    console.log(chalk.cyanBright("5. BACK")); 
    console.log(chalk.cyanBright("6. EXIT"));

    rl.question(chalk.yellow("Enter the choices : "), (choices) => {
        switch (choices) {
            case '1':
                deposit();
                break;
            case '2':
                withdraw();
                break;
            case '3':
                viewAccount();
                break;
            case '4':
                changepass();
                break;
            case '5':
                showMenu();
                break;
            case '6':
                console.log(chalk.greenBright("EXITED...✅"));
                rl.close();
                break;
        }
    })
}

async function register(){
    const db = await dbo.DB();
    const collection = db.collection('employees');
    rl.question(chalk.yellow("Enter the Name : "),async (name) => {
    rl.question(chalk.yellow("Enter the password : "),async (pass) => {
    
        const info = {NAME : name, PASSWORD : pass, BALANCE : 0};
        const result = await collection.insertOne(info);

        if(result.insertedId){
            console.log(chalk.greenBright("SUCCESSFULLY REGISTERED...✅"));
            console.log();
            showMenu();
        }
        else{
            console.log(chalk.redBright("REGISTRATION FAILED...❌"));
            console.log();
            showMenu();
        } 
    })
    })
}
let loginuser = null;
//loginuser
async function login(){
    const db = await dbo.DB();
    const collection = db.collection('employees');
        rl.question(chalk.yellow("Enter the Name : "),async (name) => {
            rl.question(chalk.yellow("Enter the Pass : "),async (pass) => {
                loginuser = name;
               const user = await collection.findOne({NAME: name, PASSWORD : pass})
               if(user){
                console.log(chalk.greenBright("SUCCESSFULLY LOGGED IN...✅"));
                account();
               }
               else{
                console.log(chalk.redBright("LOGIN FAILED...❌"));
                showMenu();
               }
            })
        })
}
//user display
async function display(){
    const db = await dbo.DB();
    const collection = db.collection('employees');
    const cursor = await collection.find({}).project({NAME:1,_id:0}).toArray();
    if(cursor.length!=0){
        console.log(chalk.greenBright("DISPLAYING...✅"));
        console.table(cursor);
        showMenu();
    }
    else{
        console.log(chalk.redBright("DISPLAY FAILED - NO DATA...❌"));
        showMenu();
    }
}

async function deposit(){
    const db = await dbo.DB();
    const collection = db.collection('employees');
  rl.question(chalk.yellow("Enter Amount : "),async (amount) => {
    const deposit = parseInt(amount);
    if(deposit<=0){
        console.log(chalk.redBright("Invalid Amount...❌"));
            account();
    }
    const user = await collection.findOne({NAME : loginuser})
    let currentBalance = user.BALANCE||0;
    const result = await collection.updateOne(
            { NAME: loginuser },
            { $set: { BALANCE: currentBalance + deposit } }
        );
        if(result.modifiedCount>0){
            console.log(chalk.greenBright("DEPOSITED SUCCESSFULLY...✅"));
            account();
        }
        else{
            console.log(chalk.redBright("DEPOSIT FAILED...❌"));
            account();
        }
  })
}
async function viewAccount(){
    const db = await dbo.DB();
    const collection = db.collection('employees');
    const cursor = await collection.find({NAME:loginuser}).project({_id:0,PASSWORD:0}).toArray();
    if(cursor.length>0){
        console.log(chalk.greenBright("DISPLAYING...✅"));
        console.table(cursor);
        console.log();
        account();
        console.log();
    }
    else{
        console.log(chalk.redBright("NO DATA...❌"));
        console.log();
        account();
        console.log();
    }
}
async function withdraw(){
    const db = await dbo.DB();
    const collection = db.collection('employees');
    rl.question(chalk.yellow("Enter Amount : "),async (amount) => {
        const withdraw = parseInt(amount);
        const user = await collection.findOne({NAME : loginuser})
        let currentBalance = user.BALANCE||0;
        let result = await collection.updateOne(
            {NAME : loginuser},
            { $set: { BALANCE: currentBalance - withdraw } }
        )
        if(result.modifiedCount>0){
            console.log(chalk.greenBright("WITHDRAWN SUCCESSFULLY...✅"));
            console.log();
            account();
            console.log();
        }
        else{
            console.log(chalk.redBright("WITHDRAW FAILED...❌"));
            console.log();
            account();
            console.log();
        }
    })
}
//change password 
async function changepass(){
    const db = await dbo.DB();
    const collection = db.collection('employees');
    rl.question(chalk.yellow("Enter the Registered Name : "),async (curname) => {
      const namecrt = await collection.findOne({NAME:curname});
      if(namecrt){
        rl.question(chalk.yellow("Enter the Password : "),async (pass) => {
            const passcrt = await collection.find({PASSWORD:pass});
            if(passcrt){
                rl.question(chalk.yellow("Enter the New-Pasword : "),async (newpass) => {
                    const result = await collection.updateOne(
                        {NAME:curname},
                        {$set: {PASSWORD:newpass}})
                        if(result.modifiedCount>0){
                            console.log(chalk.greenBright("UPDATED SUCCESSFULLY...✅"));
                            account();
                        }
                        else{
                            console.log(chalk.redBright("UPDATION FAILED...❌"));
                            account();
                        }
                })
            }
        })
      }
      else{
        console.log(chalk.gray("Please Enter Correct Registered name...!"));
        account();
      }
    })
}

showMenu();
