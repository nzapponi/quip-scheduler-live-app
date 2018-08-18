export const createUrlWithQuery = (url, query) => {
    const queryArray = [];
    for (let key in query) {
        queryArray.push(`${key}=${encodeURIComponent(query[key])}`);
    }
    const queryString = queryArray.join('&');

    if (queryString.length === 0) {
        return url;
    } else {
        return `${url}?${queryString}`;
    }

};