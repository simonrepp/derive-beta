module.exports = data => {
  // TODO: Switch to maps to save us this whole stuff everywhere?
  data.urbanize.features = [...data.features].filter(feature => feature.urbanize === '2021');
  data.urbanize.title = 'urbanize! 2021';

  for(const event of Object.values(data.urbanize.events)) {
    event.participants = [];
  }

  const participantsByName = {};
  for(const participant of data.urbanize.participants) {
    participant.events = [];
    participantsByName[participant.name] = participant;
  }

  const eventsByTitle = {};
  for(const event of Object.values(data.urbanize.events)) {
    eventsByTitle[event.title] = event;
  }

  for(const feature of data.urbanize.home.features) {
    if(!feature.eventTitle) continue;

    const event = eventsByTitle[feature.eventTitle];

    if(event !== undefined) {
      feature.event = event;
    } else {
      feature.flaggedForRemoval = true;
      const error = feature.eventField.valueError(`Die verlinkte Veranstaltung mit dem Titel '${feature.eventTitle}' wurde nicht gefunden - möglicherweise ein Tippfehler?`);

      data.warnings.push({
        files: [{ path: data.urbanize.home.sourceFile, selection: error.selection }],
        message: error.text,
        snippet: error.snippet
      });
    }
  }

  data.urbanize.home.features = data.urbanize.home.features.filter(feature => !feature.hasOwnProperty('flaggedForRemoval'));

  for(const event of Object.values(data.urbanize.events)) {
    // TODO: Actually: Connect participants and events both ways
    event.participants = [];
    for(const participantReference of event.participantReferences) {
      const participant = participantsByName[participantReference.name];

      if(participant !== undefined) {
        event.participants.push(participant)
        participant.events.push(event);
      } else {
        const error = participantReference.item.valueError(`Die verlinkte Beteiligte mit dem Namen '${participantReference.name}' wurde nicht gefunden - möglicherweise ein Tippfehler?`);

        data.warnings.push({
          files: [{ path: event.sourceFile, selection: error.selection }],
          message: error.text,
          snippet: error.snippet
        });
      }
    }
  }
};
