var express = require('express');
var request = require('request-promise');
var app = express();

const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?appid=b50a8ebaff3e45413c6fe674489f5541&units=metric";
const imageUrl = "https://api.unsplash.com/search/photos?page=1&client_id=284ab250f4d0cd5fe2d1538ffa5d30a58d76e96fadfc90362d0a7aeb3191ef20";

app.get("/", (req, res, next) => {
    let city = req.query.city;
    let size = req.query.size?req.query.size:"regular";
    let num_imgs = req.query.num_imgs;
    let orientation = req.query.orientation;

    res.setHeader('Access-Control-Allow-Origin', '*');
    const weatherCityUrl = weatherUrl + "&q="+ city
    var imageCityUrl = imageUrl+ "&query="+ city  
    
    if(num_imgs){
        imageCityUrl = imageCityUrl + "&per_page=150" 
    }
    
    if(orientation){
        imageCityUrl = imageCityUrl + "&orientation="+orientation
    }
     

    const promise1 = new Promise(function(resolve, reject) {
        weatherRequest(weatherCityUrl, (json)=>{
 
             let weatherInstance ={temp: json.main.temp,
                 temp_max :json.main.temp_max,
                 temp_min:json.main.temp_min,
                 humidity: json.main.humidity,
                 pressure: json.main.pressure,
                 iconurl: "http://openweathermap.org/img/w/" + json.weather[0].icon + ".png",
                 weatherShortDescription: json.weather[0].main,
                 weatherLongDescription: json.weather[0].description}
             resolve(weatherInstance);
         }).catch(function(error) {
            reject(error);
          }); 
      });
      const promise2 = new Promise(function(resolve, reject) {
        imageRequest(imageCityUrl, (json)=>{ 
             let images = json.results
             var imagesInstance = [];   
             for(i=0;i<images.length; i++){
                imagesInstance[i] = {title:images[i].description, url:images[i].urls[size]};          
             }
            
             if (num_imgs) {
                imagesInstance = getRandomArrayElements(imagesInstance, num_imgs)
             }
             
             resolve({images:imagesInstance});
         }).catch(function(error) {
            reject(error);
          }); 
      });

  
    Promise.all([promise1,promise2]).then(function(values) {
        let result = Object.assign(values[0], values[1]);
        res.json(result);
      });
   });

  
app.listen(process.env.PORT || 3000, () => {
 console.log("Server running on http://localhost:3000");
});

const weatherRequest = async function(url, callback) {
    console.log('weather url',url)
    const weatherJson = await request(url,{json:true});
    callback(weatherJson);
}
const imageRequest = async function(url, callback) {
    console.log('unsplash url',url)
    const imageJson = await request(url,{json:true});
    callback(imageJson);
}

const getRandomArrayElements = function(arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}
