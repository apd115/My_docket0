//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

// transforms the JSON text of incoming request into JS-accessible variable
app.use(bodyParser.urlencoded({ extended: true }));

// look for static files into public folder
app.use(express.static("public"));

//We were fatching data from this array but now we create a DB and store the data.
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// -------connect to a DB--------
//used {useNewUrlParser:true} to avoid deprecation warning

//for srv connect to mongoDB database server
//mongodb+srv://todo:<password>@cluster0.dqh3aau.mongodb.net/?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://todo:1223@cluster0.dqh3aau.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

//create a schema for our list db
const itemsSchema = new mongoose.Schema({
  name: String,
});


//create a MODEL(first word Capital)
const Item = new mongoose.model("Item", itemsSchema);


//----------create new schema and model for new routes ie. various lists-----------
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List= mongoose.model("List", listSchema);
//----------------------------------------------------------------------------
//now since we dont use array we will make docs from above model
//to store and render them in our list.

const item1 = new Item({
  name: "welcome to your todoList!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<---- Hit this to delete an item",
});

//basic entries of a new list 
const defaultItems = [item1, item2, item3];

//--------------my get--------------------

app.get("/", function (req, res) {
  // const day = date.getDate();

  Item.find({}, function (err, foundItem) {
    if (foundItem.length === 0) {
      //insert the above array in our db using the model that we made
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("inserted successfully");
        }
      });

      res.redirect("/");
    } else {

      //view engine will use this render function to look for gievn file(list.ejs) in views folder.
      //and we have passed key,value pairs too.
      res.render("list", { listTitle: "Today", newListItems: foundItem });
    }
  });
});

//dynamic routing using express route parameter

app.get("/:customListName", function(req, res){

  // use req object parameter to get custom list name..Express routing parameters
  const customListName = req.params.customListName;


  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new js object of default ites for custom list using List mongODB model
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        // list.save(); 
        // res.redirect("/" + customListName);//always use save function with async fucntions
        list.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/" + customListName);
          }
        });
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


//---------------------------- handle post requests-----------------------------

//post request to home route to save items
app.post("/", function (req, res) {
  // used req obj parameters to get values from a post request when a post req is made to home route
const itemName = req.body.newItem;
const listName = req.body.list.trim();

// save below created document/obj in db
const item = new Item({
  name: itemName
});

if (listName === "Today"){
  // *** Save item to mongoose: ***

  // item.save();
  item.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      // *** render item to home page: ***
      res.redirect("/");
    }
  });
}
else {

  // when list is found in DB it is refered using foundList
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    // foundList.save();
    foundList.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  });
}
});


//post request to delete route to delete items
app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox.trim();  //to get id of checked item
const listName = req.body.listName.trim();

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
}
else {

  // when not today , we have to redirect to the given custom list
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}
});


// const port= process.env.PORT;
// if(port== null || port=="")
// {
//   port=3000;
// }
app.listen(3000, function () {
  console.log("Server running succesfully");
});








//---------------------------------------------------------------------------------------------------





// ***** *** Require Packages: with no DB used*** *****
/*
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
 
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
// *** Create a New Database inside MongoDB via Connecting mongoose: ***
mongoose.connect("mongodb://localhost:27017/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true}); // ==> use this if deprect a warning 
 
// *** Create a Schema: ***
const itemsSchema = {
  name: String
};
 
// *** Create a Model: (usually Capitalized) ***
const Item = mongoose.model("Item", itemsSchema);
 
// *** Create a Mongoose Documents: ***
const item1 = new Item({
  name: "Welcome to your todolist!"
});
 
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3];
 
// *** Create a list Schema: ***
const listSchema = {
  name: String,
  items: [itemsSchema]
};
 
// *** Create a list Model: ***
const List = mongoose.model("list", listSchema);
 
app.get("/", function(req, res) {
  // *** Mongoose find() ***
  Item.find({}, function(err, foundItems){
 
    if (foundItems.length === 0) {
      // *** Mongoose insertMany() ***
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to databse.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }   
  });
});
 
// *** Create a custom parameters Route: ***
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name: customListName}, function(err, foundList){
 
    if (!err) {
      if (!foundList) {
        // *** Create a new list: ***
        // *** Create a new Mongoose Document: ***
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        // list.save();
        list.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/" + customListName);
          }
        });
        //res.redirect("/" + customListName);
        
      }
      else {
        // *** Show an existing list: ***
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
 
  });
  
});

app.post("/", function(req, res){
  // *** Adding a New Item: ***

const itemName = req.body.newItem;
const listName = req.body.list.trim();

const item = new Item({
  name: itemName
});

if (listName === "Today"){
  // *** Save item to mongoose: ***

  // item.save();
  item.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      // *** render item to home page: ***
      res.redirect("/");
    }
  });
  
  // res.redirect("/");
}
else {
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    // foundList.save();
    foundList.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
    // res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox.trim();
const listName = req.body.listName.trim();

if (listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) {
      // mongoose.connection.close();
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
}
else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}
});


// app.get("/about", function(req, res){
// res.render("about");
// });

app.listen(3000, function() {
console.log("Server started on port 3000");
});


*/