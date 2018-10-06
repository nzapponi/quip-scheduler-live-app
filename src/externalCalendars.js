import { createUrlWithQuery } from './shared/utils.js';

class CalendarIntegration {
    authRequest = (auth, requestParams) => {
        if (auth && auth.isLoggedIn()) {
            return auth.request(requestParams)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else if (response.status == 401) {
                        return auth.refreshToken()
                            .then(() => auth.request(requestParams))
                            .then(response => {
                                if (response.ok) {
                                    console.log('Refreshed token');
                                    return response.json();
                                } else {
                                    const err = new Error(response.statusText);
                                    err.status = response.status;
                                    throw err;
                                }
                            })
                            .catch(err => {
                                throw err;
                            });
                    } else {
                        const err = new Error(response.statusText);
                        err.status = response.status;
                        throw err;
                    }
                });
        } else {
            const err = new Error('Missing auth or not logged in');
            return Promise.reject(err);
        }
    }
}

class GoogleCalendar extends CalendarIntegration {
    label = 'Google'

    login(auth) {
        return auth.login({
            access_type: 'offline',
            prompt: 'consent'
        });
    }

    checkAvailability(auth, startTime, endTime) {
        const queryParams = {
            singleEvents: true,
            orderBy: 'startTime',
            timeMin: startTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            timeMax: endTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            timeZone: 'UTC'
        };

        return this.authRequest(auth, {
            url: createUrlWithQuery('https://www.googleapis.com/calendar/v3/calendars/primary/events', queryParams)
        })
            .then(data => {
                return data.items.filter(event => !event.transparency || event.transparency != 'transparent');
            });
    }
}

class Microsoft365 extends CalendarIntegration {
    label = 'Outlook 365'

    login(auth) {
        // This will most likely need to be changed
        return auth.login({
            access_type: 'offline',
            prompt: 'consent'
        });
    }

    checkAvailability(auth, startTime, endTime) {
        console.log(`Microsoft is checking availability for ${startTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ')} - ${endTime.format('YYYY-MM-DDTHH:mm:ss.SSSZ')}`);

        const queryParams = {
            startDateTime: startTime.add('seconds', 1).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDateTime: endTime.subtract('seconds', 1).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        };
        
        return this.authRequest(auth, {
            url: createUrlWithQuery('https://graph.microsoft.com/v1.0/me/calendarview', queryParams)
        })
            .then(data => {
                return data.value.filter(event => event.showAs == 'busy' && !event.isCancelled)
            });
    }

}

export const SUPPORTED_PROVIDERS = {
    'google': new GoogleCalendar(),
    'microsoft': new Microsoft365()
};

class ExternalCalendars {
    provider = null
    name = null
    isLoggedIn = false

    updateStatus() {
        const providers = Object.keys(SUPPORTED_PROVIDERS).map(provider => ({
            auth: quip.apps.auth(provider),
            name: provider
        }));

        for (let provider of providers) {
            let auth = quip.apps.auth(provider.name);
            if (!this.isLoggedIn && provider.auth && provider.auth.isLoggedIn()) {
                this.isLoggedIn = true;
                this.provider = provider.auth;
                this.name = provider.name
            }
        }
    }

    login(providerName) {
        if (SUPPORTED_PROVIDERS[providerName] && !this.isLoggedIn) {
            // log in here
            const handler = SUPPORTED_PROVIDERS[providerName];
            const auth = quip.apps.auth(providerName);
            return handler.login(auth)
                .then(() => {
                    console.log('Login successful!');
                    this.isLoggedIn = true;
                    this.provider = auth;
                    this.name = providerName;
                });
        } else {
            return Promise.reject('Provider specified is not supported');
        }
    }

    logout() {
        if (this.isLoggedIn) {
            return this.provider.logout()
                .then(() => {
                    console.log('Logout successful!');
                    this.isLoggedIn = false;
                    this.provider = null;
                    this.name = null;
                });
        } else {
            return Promise.reject();
        }
    }

    checkAvailability(startTime, endTime) {
        if (this.isLoggedIn) {
            const handler = SUPPORTED_PROVIDERS[this.name];
            return handler.checkAvailability(this.provider, startTime, endTime);
        } else {
            return Promise.reject('Not logged in');
        }
    }
}

export default ExternalCalendars;