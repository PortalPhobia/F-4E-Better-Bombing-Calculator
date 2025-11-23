# F-4E Better Bombing Calculator
A comprehensive overhaul of the default in-game Bombing Calculator overlay for the Heatblur F-4E Phantom II in DCS.

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/main_page.jpg">
        <img src="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/main_page.jpg" width="200px;">
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/radar_page.jpg">
        <img src="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/radar_page.jpg" width="200px;">
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/perf_page.jpg">
        <img src="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/perf_page.jpg" width="200px;">
      </a>
    </td>
	<td align="center">
      <a href="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/saved_page.jpg">
        <img src="https://github.com/PortalPhobia/F-4E-Better-Bombing-Calculator/blob/486712a8feb1438ed6113639cedcaa9e954bc44d/Images/saved_page.jpg" width="200px;">
      </a>
    </td>
  </tr>
</table>

# Features
## Revised Bombing Logic:
- All supported bombing modes now utilize Release Angle rather than Dive/Loft Angle.
- Negative angles indicate a dive and positive angles indicate a loft.
- Increases flexibility by allowing more accurate loft attacks in TGT-Find mode, for example.
	
## Visual Improvements:
- Collapsible Interval & Pattern Calculators: Quickly and easily toggleable with a single click to free up space when they're not needed.
- Revised Layout: Some elements have been moved or reorganized to improve cohesiveness.
	
## Advanced SAVED Tab Functionality:
- Load Functionality: One click to instantly reload saved data back into the calculator for adjustment.
- Direct Deletion: Easily remove individual entries (x) without clearing the entire list.
- Improved Readability: Compact layout with clearer data formatting.

## New Interval Calculator:
- Calculates optimum weapon release interval based on release speed, release angle, weapon quantity, and target length to maximize damage while bombing runways, for example.
- Target length supports both nm and ft with automatic conversion.
- Once the release interval has been set, easily send it to the pattern calculator with the "set ▼" button.

## More Accurate Offset Bombing:
- Two Selectable Offset Methods: Dist/Brg & Lat/Long.
- IP & Target coordinates can be copied directly from the in-game map by pressing LAlt+LMouse, pressing the copy button, then pasting it into the respective box.
- Includes projection parameters for specific dcs maps (syria, caucasus, falklands, etc.) to improve the accuracy of coordinate-based offset calculations. (credit:  jonathanturnock https://github.com/jonathanturnock/dcs-projections).
- NOTE: Coordinate based offset bombing is still a work in progress and may not be accurate on all maps. Germany CW is not yet supported. If you have any issues, please leave a comment!

## New RADAR Tab:
- Allows easy calculation of Antenna Elevation Angle for curious pilots and new WSOs alike. 
- Enter the relative altitude of the target to you and their range to receive an exact radar antenna elevation number.
- Calculations can easily be saved and loaded to and from the saved tab.

 ## New PERF Tab:
- Allows simple performance calculations to find estimated endurance and range.
- Provides a simple one step method to getting the exact approach speed of your f-4e based on current or estimated landing weight, calculated with the real-world formula.
- Calculations can easily be saved and loaded to and from the saved tab.


# Installation & Usage:
- Navigate to ...\DCSWorld\Mods\aircraft\F-4E\UI\BombingTable.
- Create a folder named "Original" or something similar, and move all the original files there.
- Move the mod files into the BombingTable folder.
- Press "B" in-game to use your shiny new Better Bombing Calculator.


# Possible Future Features:
- Persistent Saves: your saved calculations and settings (theme, etc.) are now stored automatically and persist across game restarts.
- Expanded PERF tab to calculate optimum speeds and altitudes based on aircraft drag index.

Constructive criticism and suggestions for new features are always welcome! I hope you enjoy :)

# Credits
Modified from the original Bombing Calculator code by Heatblur \
Thank you to JonathanTurnock for his DCS World Projections list:
- https://github.com/JonathanTurnock/dcs-projections

# Changelog
## v1.0B [2025/11/23]
- Added the ability to press "B" to close the overlay without having to click off the overlay, as long as an input field is not selected
