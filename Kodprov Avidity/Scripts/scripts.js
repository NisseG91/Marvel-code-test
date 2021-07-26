//Change these api-keys for your own.
const PUBLIC_API_KEY = 'This should be your public API-key';
const PRIVATE_API_KEY = 'This should be your private API-key';
const BASE_MARVEL_URL = 'http://gateway.marvel.com/v1/public/';

//Gets timestamp needed for API-calls
const getTs = () => {
    return new Date().getTime();
}

/**
 * Gets hash-string needed for API-calls. 
 * @param {any} ts - timestamp to use.
 */
const getHash = (ts) => {
    return md5(ts + PRIVATE_API_KEY + PUBLIC_API_KEY);
}

/**
 * Returns all parameters needed for api-calls 
 * API-calls need 3 parameters to work: 
 * a timestamp
 * a public api key
 * and an MD5-hash consisting of the same timestamp as above+a private API-key + the same public API key as above.
 * */
const getParams = () => {
    let ts = getTs();
    return '?ts=' + ts + "&apikey=" + PUBLIC_API_KEY + "&hash=" + getHash(ts);
}

/**
 * Returns URL needed to get a story 
 * @param {any} idToGet - ID to get!
 */
const getStoryUrl = () => {
    return BASE_MARVEL_URL + 'stories/' + idToGet + getParams();
}

/**
 * Gets character - needs a specific characterURI
 * @param {any} characterURI - uri to get
 */
const getCharacter = (characterURI) => {
    $.ajax({
        url: characterURI + getParams(),
        dataType:"json",
        type: "get",
        async: true,
        success: function (data) {
            let name = data.data.results[0].name;
            let imgsrc = data.data.results[0].thumbnail.path + '.' + data.data.results[0].thumbnail.extension;
            let toAppend = '<div class="character-container" >\
                                <h2 class="character-name">'+ name+ '</h2> \
                                <img alt="image showing '+name+'" class="character-img" src="' + imgsrc + '" />\
                            </div >\
                            ';
            $('#character-section').append(toAppend);
            
        },
        error: function (xhr) {

        }
    });
};
/**
 * Gets story - returns result from api
 * @param {any} idToGet - id of story 
 */
const getStory = (idToGet) => { 
    let toReturn = undefined;
    
    $.ajax({
        url: getStoryUrl(idToGet),
        dataType: "json",
        type: "get",
        async: true,
        success: function (data) {
           //Show result container and build the page if everything went fine
            $('#result-container').removeClass('d-none');

            buildPage(data);
        },
        error: function (xhr) {
            //Hide results-container if something went wrong
            $('#result-container').addClass('d-none');
            //The specified story wasnt found
            if (xhr.responseJSON.code === 404) 
                $('#story-description').text("Story not found");
            else//else just return undefined, can be used in the future for error handling.
                return undefined;
            //TODO: Write some cool error handling
        }
    });
}
/**
 * Builds the page based on the data recieved from the marvel story API
 * @param {any} data - data recieved from marvel story API
 */
const buildPage = (data) => {
    //sets the description of the page to the story's description
    let description = data.data.results[0].description;
    $('#story-description').text(description || "There was no description");

    let characters = data.data.results[0].characters;
    //first empty the character section - in case there is old characters still around.    
    $('.character-container').remove();
    characters.items.forEach(function (char) {
        getCharacter(char.resourceURI);
    });

    //Set attribution text 
    let attributionText = data.attributionText;
    $('footer').text(attributionText);

   

}
/**
 * Does the search - including building of page.
 * */
const doSearch = () => {
    let val = $('#id-to-get').val();
    if (val.length === 0)
        alert('Please input a value to find. 13379 is nice :)');
    else
        getStory(val);
}


$(document).ready(function () {
    //Search by pressing enter
    $('#id-to-get').keyup(function (e) {
        if (e.key === 'Enter')
            doSearch();
    });
    //or by clicking the serach-button
    $('#search-btn').click(function () {
        doSearch();
    });
}); 