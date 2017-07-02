let express = require("express");

let app = express();

app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port 3000");
})