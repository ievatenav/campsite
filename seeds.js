const mongoose = require("mongoose");
const Campsite = require("./models/campsite");
const Comment = require("./models/comment");

let data = [
  {
      name: "Cloud's Rest",
      img: "https://cdn.pixabay.com/photo/2017/06/17/03/17/gongga-snow-mountain-2411069_960_720.jpg",
      description: "Lorem ipsum dolor sit amet, pro ne mutat interesset necessitatibus. Labitur legendos nec et, has ad facete verear singulis. Consul hendrerit te duo, vim at stet justo constituto. Vis ei dicam intellegat adversarium, mundi hendrerit liberavisse eam ut. Pro esse graecis ex, sit no nisl maluisset necessitatibus."
  },
  {
      name: "Desert Mesa",
      img: "https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_960_720.jpg",
      description: "Lorem ipsum dolor sit amet, saperet detraxit scripserit ad vim, feugait persecuti eos ea, vitae tollit inimicus in sit. Menandri cotidieque id pri, lucilius intellegat in vim. Wisi dicant fabulas cum ut. Est an eruditi senserit, an eos nonumes nominati praesent. Cu omnium vocent qui."
  },
  {
      name: "Seaside Sunset",
      img: "https://cdn.pixabay.com/photo/2016/03/30/02/57/camping-1289930_960_720.jpg",
      description: "Lorem ipsum dolor sit amet, ne doming phaedrum per, ea usu sententiae elaboraret. Eu populo appellantur pro. Veritus molestiae ad pro, semper incorrupte constituam duo no. Per no insolens sententiae voluptatibus, id has summo fabellas efficiendi. Pri menandri splendide te, sit te esse saepe vocibus, feugait accumsan ex eos. Te vero possim consequuntur pro, qui labores debitis accusam ut, partem libris mnesarchum te vix. Nostro mandamus molestiae per no, usu eu omittam cotidieque."
  }
];

function seedDB(){
    // Remove all campsites
    Campsite.deleteMany({}, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("Removed Campgrounds");
        // Add a few campsites
        data.forEach(function(seed){
            Campsite.create(seed, function(err, campsite){
               if(err){
                   console.log("err");
               } else {
                   console.log("Added a campsite");
                    // Create a comment
                    Comment.create({
                        text: "This place is great, but I wish I had internet, so I can code!",
                        author: "Homer"
                    }, function(err, comment){
                        if(err) {
                            console.log(err);
                        } else {
                            campsite.comments.push(comment);
                            campsite.save();
                            console.log("A new comment was created");
                        }
                    });
               }
            });
        });
    }
})}

module.exports = seedDB;

