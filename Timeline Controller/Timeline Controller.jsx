{
    // Create the main UI panel
    var win = new Window("palette", "Timeline Controller", undefined);
    win.orientation = "column"; // Vertical arrangement

    // Create a button group for each button to keep UI clean
    function createButtonGroup(win, color, buttonText) {
        var group = win.add("group");
        group.orientation = "column";
        group.graphics.backgroundColor = group.graphics.newBrush(group.graphics.BrushType.SOLID_COLOR, color);
        return group.add("button", undefined, buttonText);
    }

    // Create Buttons with respective colors
    var btn1 = createButtonGroup(win, [0.6, 1.0, 0.6, 1], "Layer Sequence Organizer"); // Light Green
    var btn2 = createButtonGroup(win, [0.6, 0.85, 1.0, 1], "Duplicate at Markers");    // Light Blue
    var btn3 = createButtonGroup(win, [1.0, 0.85, 0.4, 1], "Timed Marker Master");     // Gold

    // Display the window
    win.center();
    win.show();

    // *** Button 1: Layer Sequence Organizer ***
    btn1.onClick = function arrangeLayersSequentially() {
    var dialog = new Window("dialog", "Layer Sequence Organizer");

    // Add dropdown for order selection
    dialog.add("statictext", undefined, "Choose the order:");
    var dropdown = dialog.add("dropdownlist", undefined, ["Ascending", "Descending"]);
    dropdown.selection = 0; // Default to Ascending

    // Add OK and Cancel buttons
    var okButton = dialog.add("button", undefined, "OK");
    var cancelButton = dialog.add("button", undefined, "Cancel");

    // Action for OK and Cancel buttons
    okButton.onClick = function() { dialog.close(1); };
    cancelButton.onClick = function() { dialog.close(0); };

    // Show the dialog and process the response
    if (dialog.show() == 1) {
        var orderType = dropdown.selection.text;
        app.beginUndoGroup("Arrange Layers");

        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            var selectedLayers = comp.selectedLayers;

            if (selectedLayers.length > 0) {
                var currentStartTime = selectedLayers[0].inPoint;

                // Fix: Swapped the logic for Ascending and Descending
                if (orderType === "Ascending") {
                    selectedLayers.reverse(); // Reverse for Ascending
                }

                // Arrange layers by their durations
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    layer.startTime = currentStartTime;
                    currentStartTime += (layer.outPoint - layer.inPoint);
                }
            } else {
                alert("No layers selected. Please select layers to arrange.");
            }
        } else {
            alert("Please select a composition.");
        }

        app.endUndoGroup();
    }
};

    // *** Button 2: Duplicate at Markers ***
    btn2.onClick = function() {
        var comp = app.project.activeItem;

        if (comp instanceof CompItem && comp.selectedLayers.length > 0) {
            var selectedLayers = comp.selectedLayers;
            var markers = comp.markerProperty;

            app.beginUndoGroup("Duplicate Layers at Markers");

            // Duplicate layers at each marker
            for (var l = 0; l < selectedLayers.length; l++) {
                var layer = selectedLayers[l];
                for (var i = 1; i <= markers.numKeys; i++) {
                    var markerTime = markers.keyTime(i);
                    var newLayer = layer.duplicate();
                    newLayer.startTime = markerTime;
                }
            }

            app.endUndoGroup();
        } else {
            alert("Please select at least one layer in a composition.");
        }
    };

    // *** Button 3: Timed Marker Master ***
    btn3.onClick = function addMarkersWithCustomColors() {
        var dialog = new Window("dialog", "Add Markers with Colors");

        // Input fields for interval
        dialog.add("statictext", undefined, "Enter the interval (hours):");
        var hoursInput = dialog.add("edittext", undefined, "0");
        hoursInput.characters = 3;

        dialog.add("statictext", undefined, "Enter the interval (minutes):");
        var minutesInput = dialog.add("edittext", undefined, "1");
        minutesInput.characters = 3;

        dialog.add("statictext", undefined, "Enter the interval (seconds):");
        var secondsInput = dialog.add("edittext", undefined, "0");
        secondsInput.characters = 3;

        // Dropdown for marker color options
        dialog.add("statictext", undefined, "Choose marker color option:");
        var colorOptionDropdown = dialog.add("dropdownlist", undefined, ["Single Color", "Random Colors"]);
        colorOptionDropdown.selection = 0;

        var labelColors = ["Red", "Yellow", "Aqua", "Pink", "Lavender", "Peach", "Light Green", "Blue",
                           "Green", "Purple", "Orange", "Brown", "Fuchsia", "Myrtle Green", "Gold", "Gray"];

        dialog.add("statictext", undefined, "Choose marker color (for Single Color option):");
        var colorDropdown = dialog.add("dropdownlist", undefined, labelColors);
        colorDropdown.selection = 0;

        var okButton = dialog.add("button", undefined, "OK");
        var cancelButton = dialog.add("button", undefined, "Cancel");

        okButton.onClick = function() { dialog.close(1); };
        cancelButton.onClick = function() { dialog.close(0); };

        if (dialog.show() == 1) {
            var intervalHours = parseFloat(hoursInput.text);
            var intervalMinutes = parseFloat(minutesInput.text);
            var intervalSeconds = parseFloat(secondsInput.text);
            var totalIntervalSeconds = (intervalHours * 3600) + (intervalMinutes * 60) + intervalSeconds;
            var colorOption = colorOptionDropdown.selection.text;
            var selectedColorIndex = colorDropdown.selection.index + 1;

            if (!isNaN(totalIntervalSeconds) && totalIntervalSeconds > 0) {
                app.beginUndoGroup("Add Markers at Intervals");

                var comp = app.project.activeItem;
                if (comp && comp instanceof CompItem) {
                    var duration = comp.duration;
                    var numMarkers = Math.floor(duration / totalIntervalSeconds);

                    for (var i = 0; i <= numMarkers; i++) {
                        var time = i * totalIntervalSeconds;
                        var marker = new MarkerValue("Marker " + (i + 1));

                        if (colorOption === "Random Colors") {
                            marker.label = Math.floor(Math.random() * 16) + 1;
                        } else {
                            marker.label = selectedColorIndex;
                        }

                        comp.markerProperty.setValueAtTime(time, marker);
                    }
                } else {
                    alert("Please select a composition.");
                }

                app.endUndoGroup();
            } else {
                alert("Invalid interval. Please enter valid numbers.");
            }
        }
    };
}
