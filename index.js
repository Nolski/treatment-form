var DataFrame = require('dataframe-js').DataFrame;
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

function getStrata() {
    let answers = $('#form').serialize().split('&').map((answer) => answer.split('='));
    const nationality = answers[0][1];
    const gender = answers[1][1];
    const above_secondary_edu = answers[2][1];
    const ever_employed = answers[3][1];
    return stratum.filter(row => {
        return row.get('nationality') == nationality &&
            row.get('gender') == gender &&
            row.get('above_secondary_edu') == above_secondary_edu &&
            row.get('ever_employed') == ever_employed;
    }).toDict()['id'][0];
}

function submitted(event) {
    event.preventDefault();
    const strata = getStrata();
    DataFrame.fromCSV('https://theirc-tashbeek-staging.azurewebsites.net/thompson-probs/')
        .then(df => {
            const probs = df.toArray()[strata].map(parseFloat);
            const rand = Math.random();
            $('#form').hide();
            if (rand < probs[0]) {
                $('#cash').show();
            } else if (rand < probs[0] && rand < probs[1]) {
                $('#information').show();
            } else if (rand < probs[3] && rand < probs[2]){
                $('#psych').show();
            } else {
                $('#control').show();
            }
        });
};
