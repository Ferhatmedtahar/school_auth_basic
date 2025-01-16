/*  src folder


Api Basics:
- create an HTTP server
- requests and responses
- Anatomy of an API
- HTTP methods
- Routing
- Middleware
- Custom middleware
- Error handling
- jwt : authentication and authorization
- validation
- ORM : Object Relational Mapping : `setup`, schema , model , migrations , queries , relations ..ect
- async handle errors 
- custome query : filter, sort, pagination, search
- global Config 
- performance optimization
- testing : jest , supertest  `npm i supertest @types/supertest jest @types/jest ts-jest `
- deployment
BEST PRACTICES : filtering, sorting, pagination , search , security, versioning, clear and plural naming
rate limiting, sanitize input , middleware , error handling , monotoring , logging , Documenting
   No blocking code
   no nested callback
   clean the unnescessary console.log

*/

/*
- we can get from the http request the body and the query params , method , url , headers , ip
- creating http server {take callback for a logic EXCUTES EVERY TIME A REQUEST IS RECIEVED } and listen on spesific port
- Client Request -> Node.js Event Loop -> HTTP Server Callback -> Response Sent
- res.end() signals that the response is complete and ready to be sent to the client , once its called any trying to change on it will throw an error 
- route is unique combination of a URL and http methods
- used to locate certain resources on the server and trigger certain actions
- route handler is a function that is executed when a certain route is matched
- server is a collection of route handlers and Close to DB 
- using express , app.[method](route , handler)
- user can send any data like file or json , image , video , audio , text , etc
- body parser : middleware that parses the request body and makes it available on req.body

//* you need an ORM to handle database operations , its like SDK for the database
- allow basic to advanced querying , relations , transactions , etc
- handle schemas , migrations , seeding.

- Drizzle ORM or  prisma ORM for postgresql and more can be used and its good 

----------------------------------------------------
!!!!##### setup:
-1 go to https://dashboard.render.com/ and create a DATABASE 
-2 once you do that , you will find :password , internal DB url , external DB url , PSQL Command
-3 copy the external DB url and paste it in the .env file under DATABASE_URL name
-4 npm i typescript ts-node @types/node prisma @types/express --save-dev
-5 create tsconfig.json file
-6  this command ```npm i -D tsx```   than ```npx tsx src/server.ts```
-7 ```npx prisma init```: generate prisma folder with schema 

----------------------------------------------------
we can create and design schema based on the entity  and the ui design to know what to create 

prisma schema easy to define :
you name the model : model User {}
syntax for field : fieldName type derectives
example : userName String @unique @default(cuid())
  updateId String
 RELATIONS: update   Update @relation(fields: [updateId], references: [id])


----------------------------------------------------
once you are finished defining the schema ,
we need to tell the database about initial schema :
! npm i @prisma/client --save    : the SDK for the database 
! run ```npx prisma migrate dev -name initial```
 MIGRATIONS :
1- teaching your database about the new shape of data 
2- migrate the database to the new shape 
THE MIGRATION HAVE NAME:bcs if we are team and one person change the schema 
we need also to have that migration to be applied to all team members 
after that the database now about it 

PRISMA CLIENT ARE GENERATED BASED ON THE SCHEMA 

----------------------------------------------------

start working on the routes than work on handlers
we want to do CRUD operations on our resources: Controller -> model
5 common operations and we can do mix of those

POST product
GET product
GET product/:id
PUT product/:id
DELETE product/:id

in 1:many relations : like a product has many updates , review..ect
when we want to access the review of a product we need to do something called merge params 
passed to the router  : GET product/:productId/reviews/:reviewId

like : router.get("/:productId/reviews")
we need to make sure that the controller of review have access to the product id by using merge params

This ensures that tourId is passed down to the reviewRouter and can be accessed via req.params productId.

and for the userId we place it on the body of the request when we run the PROTECT middleware

VERY GOOD PRACTICE 
the order or middlewares is important and matter!
!router.use(route , middleware|router) 
!router.use(middleware)
!router.route(route).method(controller)
$to do a middleware that take a argument we just make a function that return a middleware
 middleware does things like protecting routes , logging , check auth HANDLE ERRORS
and modify the request object before the route handler is called!, 
the last thing in the middleware stack is the route handler!
----------------------------------------------------
authentication and authorization :
jwt : json web token , we need to create a secret key
implement auth : login , signup ,signin, protect , restrictTo middlewares
reset password , forget password , (change) update password ,functionalities, 
email verification , 
hash password , compare password ,
the jwt will be stored either on the cookie or on the Authorization header 

hock up the auth middleware to the routes and do the user entity


----------------------------------------------------
npm i express-validator --save
npm i @types/express-validator --save-dev

the handlers are called controllers and they are the one who make the business logic
and response to the client and talk to the database

however the talking to database is dependent on the client input
so we should have  validation!!!

validation is done on post , put and patch requests 
to know what field to allow to change or idk check the logic and schema 

update: find the product and check if the user is the author of the product before updating it
delete: find the product and check if the user is the author of the product before deleting it
getOne: find the product and check if the user is the author of the product before getting it 
create : create the product and add the author id to it
getAll : get all the products that the user is the author of them
!----------------------------------------------------
ERROR HANDLING is Bellow
!----------------------------------------------------
Envirement Variables:
envirement is set of conditions in which our code in operating in 
and ofc they get injected into the app when its running   .
NODE_ENV : development , production , testing

when we are coding we are on development envirement
but when we want to deploy the app we need to change the envirement to production
we need to create a .env file and put all the envirement variables there
things can be changed based on the envirement and also things need to be SECRET:
like the database url , the secret key , the port , the logging level


!----------------------------------------------------
 Create a config folder and index.ts
 and for each envirement config we create a file  
 like : analytics, ..

import merge from "lodash.merge";

// make sure NODE_ENV is set
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const stage = process.env.STAGE || "local";
let envConfig;

// dynamically require each config depending on the stage we're in
if (stage === "production") {
  envConfig = require("./prod").default;
} else if (stage === "staging") {
  envConfig = require("./staging").default;
} else {
  envConfig = require("./local").default;
}

const defaultConfig = {
  stage,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT,
  logging: false,
};

export default merge(defaultConfig, envConfig);
*/

/*
$----------------------------------------------------

the Error contain : message , statusCode , status , isOperational
bcs there are two types of errors : operational and programming error which we make on our code 
operational error : like invalid data , fail to connect to database , request timeout , no connect to server
. Error Classification
Errors are categorized as:

Operational Errors: Expected and controlled (e.g., invalid input, resource not found, authentication issues). These are safe to send to the client.
Programming or Unknown Errors: Unexpected issues (e.g., bugs in code).
 These details should not be revealed to the client in production for security reasons.


we have sync error and we have async error
  we need to handle it by calling the next function with the error


 we create a custom error called AppError
this error will have statusCode , status , message , name , isOperational
to throw error we use next(new AppError("message",statusCode))

once we throw the error 
we have global handler that it check the error name and handle it based on it 



//--REVIEW      error that is not express error and outside of the app , node error                                             
on server
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

//REVIEW : Error Handler Implementation
Default Error Setup
javascript
Copy code
err.statusCode = err.statusCode || 500;
err.status = err.status || "error";
statusCode: HTTP status code for the error. Defaults to 500 (internal server error).
status: A human-readable string (e.g., "fail", "error").
Development Mode
javascript
Copy code
if (process.env.NODE_ENV === "development") {
  res.status(err.statusCode).json({
    err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
}
Detailed Error Logging: In development, the response includes:
message: Error message.
stack: Call stack to trace the error source.
Full error object (err) for debugging.
Production Mode
In production, sensitive error details are hidden from the client. The handler distinguishes between operational and unknown errors.

Handling Specific Error Types
javascript
Copy code
let errorApp = { ...err };

if (err.name === "CastError") {
  errorApp = handleCastErrorDB(err);
}
if (err.name === "MongoServerError" && err.code === 11000) {
  errorApp = handleMongoDuplicate(err);
}
if (err.name === "ValidationError") {
  errorApp = handleValidationError(err);
}
if (err.name === "JsonWebTokenError") {
  errorApp = handleJWTError(err);
}
if (err.name === "TokenExpiredError") {
  errorApp = handleTokenExpire(err);
}
These functions transform raw errors from libraries (like Mongoose or JWT) into user-friendly messages.
Example: MongoDB Validation Error
javascript
Copy code
function handleValidationError(err) {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid data input: ${errors.join(". ")}`;
  return new appError(message, 400);
}
Operational Errors
If the error is operational, send a safe response:

javascript
Copy code
if (errorApp.isOperational) {
  res.status(errorApp.statusCode).json({
    status: errorApp.status,
    message: errorApp.message,
  });
}
Unknown Errors
If the error is not operational, log it and send a generic message:

javascript
Copy code
else {
  console.error("Error❌", err);
  res.status(500).json({ status: "error", message: "Something went wrong" });
}
Utility Functions
Cast Error: For invalid MongoDB Object IDs.

javascript
Copy code
function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appError(message, 400);
}
Duplicate Error: For unique constraint violations in MongoDB.

javascript
Copy code
function handleMongoDuplicate(err) {
  const value = err.errmsg.match(/(["'])(\\?.)*\1/)[0];
  const message = `This ${value} already exists. Please use another value!`;
  return new appError(message, 409);
}
Validation Error: Collects and aggregates validation issues into a single message.

JWT Errors:

Invalid Token:
javascript
Copy code
function handleJWTError(err) {
  return new appError("Invalid token. Please log in again!", 401);
}
Expired Token:
javascript
Copy code
function handleTokenExpire(err) {
  return new appError("Your token has expired! Please log in again.", 401);
}

---
Robust Error Handling in Express
Middleware for Centralized Error Handling: Place the globalErrorHandler at the end of your middleware stack:

javascript
Copy code
app.use(globalErrorHandler);
Use asyncHandler to Catch Async Errors: Wrap async routes to ensure errors are passed to the error handler:

javascript
Copy code
import asyncHandler from "express-async-handler";

app.get("/route", asyncHandler(async (req, res) => {
  const data = await someAsyncFunction();
  res.status(200).json(data);
}));
Error Propagation: Pass errors explicitly using next():

javascript
Copy code
if (!user) return next(new appError("User not found", 404));
Separate Operational and Unknown Errors: Define all operational errors using the appError class, ensuring clarity and maintainability.


*/
