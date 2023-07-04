function loadSerialNumbers() {
	fetch('/serial_number_database')
		.then(response => response.json())
		.then(data => {
			// Now you have the serial number data in `data`
			serialNumbers = data.serial_numbers;
			console.log(data.serial_numbers);
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

// This function will be called when the technician selects a serial number from the dropdown
function selectSerialNumber() {
	let selectedSerialNumber = $('#serialNumberDropdown').val();

	fetch('/api/product_info', {
		method: 'POST',
		headers: {
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({ serial_number: selectedSerialNumber }),
	})
		.then((response) => response.json())
		.then((data) => {
		// Now you have the product info in `data`, and you can display it on the page
		displayProductInfo(data);
		})
		.catch((error) => {
		console.error('Error:', error);
		});
}

function displayProductInfo(product) {
	const designationElement = document.querySelector('.designation');
  
	if (!designationElement) {
	  console.error("Could not find element to display product info");
	  return;
	}
  
	designationElement.innerHTML = `
	  <p>Model Number: ${product}</p>
	`;
}

document.addEventListener('DOMContentLoaded', function() {
  	// Call the function to load the serial numbers when the page is loaded
	loadSerialNumbers();

	const actionCentre = document.querySelector('.actionCentre');
	const action_infopool = actionCentre.querySelectorAll('.action-infopool');
	const action_decision_tree = actionCentre.querySelectorAll('.actionDecisionTree');

	action_infopool.forEach(action => {
	action.addEventListener('click', function() {
		
		const newInfoPool = document.createElement('div');
		newInfoPool.classList.add('action-header');
		newInfoPool.innerHTML = `
		<div class="infopool">
			<li>SEW Info Pool</li>
			<p>SEW Info Pool is a place where you can find information you need to know about the SEW products. You can find information about the product from the SEW community.</p>
			<div class="showInformation">
			<ul id="data-list">
			</ul>
			</div>
		</div>
		`;
		const col2 = actionCentre.querySelector('.action-col-2');
		col2.appendChild(newInfoPool);

		// Fetch data from server
		fetch('/api/sew-info')
		.then(response => response.json())
		.then(data => {
			// Render data to the DOM
			const dataList = document.querySelector('#data-list');
			for (const [key, value] of Object.entries(data)) {
			const li = document.createElement('li');
			li.textContent = `${value}`;
			dataList.appendChild(li);
			}
			console.log(data)
		})
		.catch(error => console.error(error));
	});
	});

	action_decision_tree.forEach(action => {
		action.addEventListener('click', function() {

			const newDecisionTree = document.createElement('div');
			newDecisionTree.classList.add('actionDecisionTreeHeader');
			newDecisionTree.innerHTML = `
			<div class="decisionTreePanel">
				<li>Decision Tree</li>
				<p>The decision tree assists you through the customer's problem.</p>
				<div class="decisionTree">
					<input type="text" id="serialNumberInput" placeholder="Enter Serial Number">
					<select id="serialNumberDropdown"></select>
					<div class="buttons">
						<button id="option1">Error Code</button>
						<button id="option2">Manual</button>
						<button id="option3">Option 3</button>
					</div>
					<div class="designation"></div>
				</div>
			</div>
			`;
			const col2 = actionCentre.querySelector('.action-col-2');
			col2.appendChild(newDecisionTree);
		
			$("#option1").click(function() {
				$.ajax({
				url: '/api/update_model',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify({ option: 1 }),
				success: function(data, status) {
					console.log("Data: " + data + "\nStatus: " + status);
					const newTextBox = document.createElement('h2');
					newTextBox.id = 'newTextBox';
					newTextBox.placeholder = 'Enter Error Code';
					const newErrorBox = document.createElement('div');
					newErrorBox.id = 'newErrorBox';
					newErrorBox.innerHTML = `
					<p>Enter Error Code</p>
					<select id="error-code-f">
						<option value="F">F</option>
				  	</select>
					<select id="error-code-dash">
						<option value="-">-</option>
						<option value="1">1</option>
					</select>
					<select id="error-code-digit-1">
						<option value="0">0</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
					</select>
					<select id="error-code-digit-2">
						<option value="0">0</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
					</select>
				  	<button id="lookup-error-code">Lookup</button>
				  	`;
					const container = document.querySelector('.decisionTree');
					container.appendChild(newTextBox);
					container.appendChild(newErrorBox);

					// Select the Lookup button element
					const lookupButton = document.querySelector('#lookup-error-code');

					// Attach a click event listener to the Lookup button
					lookupButton.addEventListener('click', function() {
					// Get the values of the error code selects
					const fSelect = document.querySelector('#error-code-f');
					const dashSelect = document.querySelector('#error-code-dash');
					const digit1Select = document.querySelector('#error-code-digit-1');
					const digit2Select = document.querySelector('#error-code-digit-2');
					const errorCode = `${fSelect.value}${dashSelect.value}${digit1Select.value}${digit2Select.value}`;

					// Call the API endpoint with the error code
					fetch(`/api/error?code=${errorCode}`)
						.then(response => response.json())
						.then(data => {
						console.log(data);
						// Define possible_reason and activity arrays
						const possible_reason = data['Possible Reason'] || [];
						const activity = data['Activity'] || [];
						// Render the data to the DOM
						const errorDetails = document.createElement('div');
						errorDetails.id = 'errorDetails';
						errorDetails.innerHTML = `
							<li>Possible Reason:</li>
							${possible_reason.map(reason => `<p>${reason}</p>`).join('')}
							<li>Activity:</li>
							${activity.map(activity => `<p>${activity}</p>`).join('')}
						`;
						newErrorBox.appendChild(errorDetails);
						})
						.catch(error => console.error(error));
					});
				},
				error: function(xhr, textStatus, errorThrown) {
					console.log("Error: " + errorThrown);
				}
				});
			});
		
			$("#option2").click(function() {
				$.ajax({
				url: '/api/update_model',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify({ option: 2 }),
				success: function(data, status) {
					console.log("Data: " + data + "\nStatus: " + status);
				},
				error: function(xhr, textStatus, errorThrown) {
					console.log("Error: " + errorThrown);
				}
				});
			});
		
			$("#option3").click(function() {
				$.ajax({
				url: '/api/update_model',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify({ option: 3 }),
				success: function(data, status) {
					console.log("Data: " + data + "\nStatus: " + status);
				},
				error: function(xhr, textStatus, errorThrown) {
					console.log("Error: " + errorThrown);
				}
				});
			});

			// Event listener for the serial number input
			$('#serialNumberInput').on('input', function() {
				let input = $(this).val();

				// Filter serial numbers based on input
				let filteredSerialNumbers = Object.keys(serialNumbers).filter(sn => sn.startsWith(input));

				// Clear existing dropdown options
				$('#serialNumberDropdown').empty();

				// Add new dropdown options
				filteredSerialNumbers.forEach(sn => {
					$('#serialNumberDropdown').append(new Option(sn, sn));
				});

				// Trigger the change event to ensure the API request is always made
  				$('#serialNumberDropdown').trigger('change');

				// Event listener for the dropdown selection
				$('#serialNumberDropdown').on('change', function () {
					let selectedSerialNumber = $(this).val();

					// Fetch and display more data about the product
					selectSerialNumber(selectedSerialNumber);
				});
			});
		});
	});
});