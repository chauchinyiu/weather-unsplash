var express = require('express');
var request = require('request-promise');
var app = express();

const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?appid=b50a8ebaff3e45413c6fe674489f5541&units=metric";
const imageUrl = "https://api.unsplash.com/search/photos?page=1&client_id=284ab250f4d0cd5fe2d1538ffa5d30a58d76e96fadfc90362d0a7aeb3191ef20";

app.get("/weather/:city/photo/(:size)?", (req, res, next) => {
    const city = req.params.city
    const size = req.params.size?req.params.size:"regular"
    console.log(size)
    const weatherCityUrl = weatherUrl + "&q="+ city
    const imageCityUrl = imageUrl+ "&query="+ city

    const promise1 = new Promise(function(resolve, reject) {
        weatherRequest(weatherCityUrl, (json)=>{
  
             let weatherShortDescription = json.weather[0].main;
             let weatherLongDescription = json.weather[0].description;
             let temp = json.main.temp;
             let temp_max = json.main.temp_max;
             let temp_min = json.main.temp_min;
             let humidity = json.main.humidity;
             let pressure = json.main.pressure;
     
             let weatherInstance ={temp: temp,
                 temp_max :temp_max,
                 temp_min:temp_min,
                 humidity: humidity,
                 pressure: pressure,
                 weatherShortDescription: weatherShortDescription,
                 weatherLongDescription: weatherLongDescription}
             resolve(weatherInstance);
             //parse json
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
    const weatherJson = await request(url,{json:true});
    callback(weatherJson);
}
const imageRequest = async function(url, callback) {
    const imageJson = await request(url,{json:true});
    callback(imageJson);
}
