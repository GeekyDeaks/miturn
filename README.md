# miturn

Simple app to delegate turns for things like a drinks round.

Has a 'quirky' and 'colourful' UI, intended for use on
a mobile device, so it looks even more 'quirky' on a 
desktop :D

# Get Started

    git clone https://github.com/GeekyDeaks/miturn.git
    npm install
    cp config.js.template config.js
    node server

Unfortunately, you have to manually create at least one group.
You can seed some development data with the following command:

    npm run knex seed:run

# Instructions

Most of the actions are context sensitive.

- The display shows up to the last 5 rounds
- You can expand and collapse old rounds, by 
  clicking on the round title
- If there is no active round, you will have the
  option to create a 'New Round'
- If there is an active round and you have no
  request, you should see a list of the previous
  requests made in the group, with an input box
  at the bottom for any new requests
- If you have submitted a request, there will be
  the option to delete it with a red X to the left
- To the right of each request will be the delta
  which is the number of request the user is up or
  down in the group
- If you have submitted a request, there will be the
  option to accept the round (Get this round!)


