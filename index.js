var DataFrame = require('dataframe-js').DataFrame;
const path = 'https://www.dropbox.com/sh/qwh4b6e7vvqes6x/AABvZYZaMkSdmICQST2edcica/IRC-Thompson/2019-04-08_priordata.csv'

const dfs = require('dropbox-fs')({
    apiKey: 'Xs_0RUdduGAAAAAAAAAAITcC6NxxIWl6DNwYHq5GIuZJfz4lEyc8Bbdf8JSg1w-l'
});

const https = require('https');

var isExists = false

var BASE_URL = 'https://tashbeek.rescue.org/';

const stratum = new DataFrame(
    [
        [ 0, 'syrian','male',0,0 ],
        [ 1, 'syrian','male',0,1 ],
        [ 2, 'syrian','male',1,0 ],
        [ 3, 'syrian','male',1,1 ],
        [ 4, 'syrian','female',0,0 ],
        [ 5, 'syrian','female',0,1 ],
        [ 6, 'syrian','female',1,0 ],
        [ 7, 'syrian','female',1,1 ],
        [ 8, 'jordanian','male',0,0 ],
        [ 9,  'jordanian','male',0,1 ],
        [ 10, 'jordanian','male',1,0 ],
        [ 11, 'jordanian','male',1,1 ],
        [ 12, 'jordanian','female',0,0 ],
        [ 13, 'jordanian','female',0,1 ],
        [ 14, 'jordanian','female',1,0 ],
        [ 15, 'jordanian','female',1,1 ],
    ],
    ['id', 'nationality', 'gender', 'above_secondary_edu', 'ever_employed']
);

window.onload = function() {
    var form = document.querySelector("form");
    form.onsubmit = submitted.bind(form);
};


function dictToURI(dict) {
    var str = [];
    for(var p in dict){
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(dict[p]));
    }
    return str.join("&");
}

function appendLeadingZeroes(n){
  if(n <= 9){
    return "0" + n;
  }
  return n
}

function getStrata(nationality, gender, above_secondary_edu, ever_employed) {
    return stratum.filter(row => {
        return row.get('nationality') == nationality &&
            row.get('gender') == gender &&
            row.get('above_secondary_edu') == above_secondary_edu &&
            row.get('ever_employed') == ever_employed;
    }).toDict()['id'][0];
}


function makeRequest(url, nationality, gender, above_secondary_edu, ever_employed, final_result, ip) {

    const result = {
        "ip" : ip,
        "nationality" : nationality,
        "gender" : gender,
        "above_secondary_edu" : above_secondary_edu,
        "ever_employed" : ever_employed,
        "final_result": final_result
    };

    console.log(result);
    url = url + dictToURI(result)
    https.get(url, (resp) => {

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function submitted(event) {
    event.preventDefault();

    var url = BASE_URL + 'api/save-logs?';


    var answers = $('#form').serialize().split('&').map((answer) => answer.split('='));
    var nationality = answers[0][1];
    var gender = answers[1][1];
    var above_secondary_edu = answers[2][1];
    var ever_employed = answers[3][1];
    var final_result = "";
    var ip = null;
    var response = null;
    $.getJSON('http://ip-api.com/json?callback=?', function(data) {
        ip = data.query;
    });

    const strata = getStrata(nationality, gender, above_secondary_edu, ever_employed);
    console.log(strata);

    let now = (new Date());
    date_today = appendLeadingZeroes(now.getFullYear()) +  '-' + appendLeadingZeroes((now.getMonth() + 1)) + '-' + appendLeadingZeroes(now.getDate());
    dfs.readFile('/' + date_today + '_treatmentprobabilities.csv', (err, result) => {

      if(!err){
          DataFrame.fromCSV('https://theirc-tashbeek-staging.azurewebsites.net/thompson-probs/')
            .then(df => {
                const probs = df.toArray()[strata].map(parseFloat);
                const rand = Math.random();
                const prob1 = probs[0] + probs[1];
                const prob2 = prob1 + probs[2];
                $('#form').hide();

                if (rand < probs[0]) {
                    $('#cash').show();
                    final_result = "Cash"
                } else if (rand > probs[0] && rand <= prob1) {
                    $('#information').show();
                    final_result = "Information"
                } else if (rand > prob1 && rand <= prob2){
                    $('#psych').show();
                    final_result = "Psychological"
                } else {
                    $('#control').show();
                    final_result = "Control"
                }

                above_secondary_edu = above_secondary_edu === "0" ? "NO" : "YES";
                ever_employed = ever_employed === "0" ? "NO" : "YES";
                gender = capitalizeFirstLetter(gender);
                nationality = capitalizeFirstLetter(nationality);


                makeRequest(url, nationality, gender, above_secondary_edu, ever_employed, final_result, ip);

                let info = `rand: ${rand}, probs: ${probs}`;
                gtag('event', 'submit', {
                    'event_category': 'Randomize',
                    'event_label': info,
                });

                alertify.success('Response Submitted');

            });


      }
      else{

          alertify.error('Can\'t find the file ' + date_today + '_treatmentprobabilitiess.csv in the Dropbox folder');
      }


    });

};
