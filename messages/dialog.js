module.exports = {
    "callback_id": "kudos_prompt",
    "title": "Send kudos",
    "submit_label": "Request",
    "elements": [{
        "label": "Assignee",
        "name": "bug_assignee",
        "type": "select",
        "data_source": "users"
      },
      {
        "type": "text",
        "label": "Amount of Kudos",
        "name": "Amount"
      },
      {
        "label": "Add comment",
        "name": "comment",
        "type": "textarea",
        "hint": "Provide additional information if needed."
      }
  
    ]
  };