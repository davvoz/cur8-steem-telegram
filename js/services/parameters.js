
export function Url_parameters() {

    let url_string = window.location.href
    let questionMarkCount = 0;
    let modified_url = url_string.replace(/\?/g, function(match) {
        questionMarkCount++;
        return questionMarkCount === 2 ? '&' : match;
    });
    const url = new URL(modified_url);
    return url
}

window.Url_parameters = Url_parameters;