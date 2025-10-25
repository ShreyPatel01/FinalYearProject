
# GroupFlow

  

# Information about this repository

  

This is the repository that you are going to use **individually** for developing your project. Please use the resources provided in the module to learn about **plagiarism** and how plagiarism awareness can foster your learning.

  

Regarding the use of this repository, once a feature (or part of it) is developed and **working** or parts of your system are integrated and **working**, define a commit and push it to the remote repository. You may find yourself making a commit after a productive hour of work (or even after 20 minutes!), for example. Choose commit message wisely and be concise.

  

Please choose the structure of the contents of this repository that suits the needs of your project but do indicate in this file where the main software artefacts are located.

  

# Setup Before Running The System

  

The system utilizes a MongoDB cloud database, an Amazon S3 Bucket and a MailTrap testing environment, which will need to be setup so you can fully utilize the system and its features. This will involve accessing the .env file and changing the values, which will be stated in each sub-section below.

## Amazon S3 Bucket
Create a publicly available S3 bucket, and copy and paste the 
- Bucket Name to AWS_BUCKET_NAME
- Bucket Region to AWS_BUCKET_REGION
- Access Key to AWS_ACCESS_KEY
- Secret Access Key to AWS_SECRET_ACCESS_KEY

Then create the bucket policy, which should look like this:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::[yourBucketNameHere]",
                "arn:aws:s3:::[yourBucketNameHere]/projectFiles/*"
            ]
        }
    ]
}
```


As well as this, create an IAM Policy that looks like this:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::[yourBucketNameHere]",
                "arn:aws:s3:::[yourBucketNameHere]/projectFiles/*"
            ]
        }
    ]
}
```
## MongoDB Cloud Database
Setup a cluster on MongoDB, it should work with the free tier, and copy the MongoDB URI and paste the new MongoURI into the MONGO_URI variable value 

## MailTrap Testing Environment
Create an account on MailTrap, click on "Start Testing" and select "Nodemailer" on the integrations select form. Then copy the contents provided into the accountDetailsMailer.ts and the inviteToProjectMailer.ts files, as well as pasting the values of user into NODEMAILER_USER and NODEMAILER_PASS

  

# Running the system
  
- Navigate to the frontend folder using "cd Frontend"

- Run the command "npm install"

- Run the command "npm run dev"