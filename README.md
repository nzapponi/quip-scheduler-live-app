# Scheduler Live App for Quip
By James Blackledge and [Niccolò Zapponi](https://twitter.com/nzapponi)

![Scheduler Live App Screenshot](/docs/screenshot.png?raw=true)

## Usage
- Install the live app in Quip by visiting the [AppExchange](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000FOmsnUAD)
- Create a new document in Quip and add the live app by typing ```@Scheduler```
- Select the dates that you'd like to create slots in
- Create time slots inside each day by clicking on the plus button
- Share the document with other users and click on the slots that work with you
- Every user will click on the slots that work best for them, and you'll see which ones fit best
- You can also comment on each time slot to have a conversation around a specific time slot
- You can see how many people and who accepted a slot by clicking on the user icon inside the slot

- Users in different time zones will see the time slots in their own local time!

## Developer Information

- Create a new app in [Quip's developer console](https://quip.com/dev/console/) and copy the new App ID
- Paste the App ID inside manifest.json in the app folder
- Install all the app's dependencies by running ```npm install```
- Run ```npm run build```
- Upload the new app.ele file inside the app folder into Quip's developer console
- Create a new document in Quip and add the live app by typing ```@Scheduler```
- (For local development) run ```npm start```, then inside Quip click on the live app's menu and choose *Use Local Resources*.

