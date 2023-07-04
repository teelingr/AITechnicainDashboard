""" This class contains functions that clear the data from an existing database. """

import json # Used to read and write data to JSON format.

class Clear:
    def clearChatHistory():
        """ Clears the chat history. """

        with open("backend/data/chat_history.json", "w") as file:
            # Define an empty JSON to the file which is {"chat": []}
            data = {"chat": []}
            
            # Move the file cursor to the beginning
            file.seek(0)

            # Write the modified data back to the file
            json.dump(data, file, indent=4)
            file.truncate()

        print("Chat history cleared.")

    def clearLiveSummary():
        """ Clears the live summary. """

        with open("backend/data/liveSummary.json", "w") as file:
            # Update the JSON data with the modified "liveSummary" list
            data = {"liveSummary": []}

            # Move the file cursor to the beginning
            file.seek(0)

            # Write the modified data back to the file
            json.dump(data, file, indent=4)
            file.truncate()

        print("Existing summary cleared.")


# Development, comment out when complete
Clear.clearLiveSummary()