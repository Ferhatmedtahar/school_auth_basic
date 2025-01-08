import { app } from "./app";

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(
    `server is running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});
