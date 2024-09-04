import "./App.css";
import React, { useState, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function App() {
  const [persons, setPersons] = useState(4);
  const [slicesPerPerson, setSlicesPerPerson] = useState(2);
  const [pizzaSlices, setPizzaSlices] = useState([]);
  const [currentPerson, setCurrentPerson] = useState(1);
  const [personSlices, setPersonSlices] = useState({});
  const [names, setNames] = useState([]);
  const [customNames, setCustomNames] = useState(false);
  const [symmetryScore, setSymmetryScore] = useState(0);
  const [fairnessMetrics, setFairnessMetrics] = useState({});
  const [costsPerPerson, setCostsPerPerson] = useState({});
  const [allSlicesTaken, setAllSlicesTaken] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState("Pepperoni");
  const [inputType, setInputType] = useState("degrees");
  const [inputValues, setInputValues] = useState("");
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleInputValues = (e) => {
    const inputValue = e.target.value;
    setInputValues(inputValue);
    setError("");
    const regex = /^(\d+(\.\d+)?,)*(\d+(\.\d+)?)?$/;
    if (!regex.test(inputValue)) {
      setError("Invalid input format. Please use comma-separated numbers.");
    }
  };

  const handleSubmit = () => {
    const values = inputValues.split(",").map((p) => parseFloat(p.trim()));

    let isValidInput = false;
    if (inputType === "degrees") {
      isValidInput = values.reduce((sum, val) => sum + val, 0) === 360;
      if (!isValidInput) {
        setError("Invalid input. The sum of all degrees must be 360°.");
        return;
      }
    } else if (inputType === "percentages") {
      isValidInput = values.reduce((sum, val) => sum + val, 0) === 100;
      if (!isValidInput) {
        setError("Invalid input. The sum of all percentages must be 100%.");
        return;
      }
    }

    const expectedCount = persons * slicesPerPerson;
    if (values.length !== expectedCount) {
      setError(`Invalid input. Expected ${expectedCount} values.`);
      return;
    }

    setAllSlices(values);
    const initialSlicesTaken = {};
    for (let i = 0; i < values.length; i++) {
      initialSlicesTaken[i] = null;
    }
    setSlicesTaken(initialSlicesTaken);
    redistributeSlices();
  };

  useEffect(() => {
    if (inputType === "degrees") {
      const defaultDegreeSlices = Array(persons * slicesPerPerson).fill(
        360 / (persons * slicesPerPerson)
      );
      setAllSlices(defaultDegreeSlices);
    } else if (inputType === "percentages") {
      const defaultPercentageSlices = Array(persons * slicesPerPerson).fill(
        100 / (persons * slicesPerPerson)
      );
      setAllSlices(defaultPercentageSlices);
    }
  }, [inputType, persons, slicesPerPerson]);

  const handleInputType = (e) => {
    setInputType(e.target.value);
  };

  const pizzaPrices = {
    Pepperoni: {
      "Small Pizza": 5,
      "Medium Pizza": 8,
      "Large Pizza": 12,
      "Extra-Large Pizza": 15,
      "Party Pizza": 20,
    },
    margherita: {
      "Small Pizza": 3,
      "Medium Pizza": 5,
      "Large Pizza": 10,
      "Extra-Large Pizza": 12,
      "Party Pizza": 7,
    },
  };
  const getPizzaPrice = (pizzaType, size) => {
    if (pizzaPrices && pizzaPrices[pizzaType] && pizzaPrices[pizzaType][size]) {
      const price = pizzaPrices[pizzaType][size];
      return price;
    } else {
      return "Price not available";
    }
  };

  const generateAllSlices = () => {
    const totalSlices = persons * slicesPerPerson;
    const slicePercentage = 100 / totalSlices;
    return new Array(totalSlices).fill(slicePercentage);
  };

  const [allSlices, setAllSlices] = useState(generateAllSlices());

  const initializeSlicesTaken = (totalSlices) => {
    const slices = {};
    for (let i = 0; i < totalSlices; i++) {
      slices[i] = null;
    }
    return slices;
  };
  // Initialize when starting
  const [slicesTaken, setSlicesTaken] = useState(initializeSlicesTaken(allSlices.length));
  

  useEffect(() => {
    renderPizzaChart();
    calculateSymmetryAndFairness();
    checkAllSlicesTaken();
  }, [slicesTaken, allSlices]);

  useEffect(() => {
    if (allSlicesTaken) {
      calculateCostsPerPerson();
    }
  }, [allSlicesTaken]);

  const handleSliceClick = (index) => {
    if (slicesTaken[index] == null) {
      const newSlicesTaken = { ...slicesTaken };
      newSlicesTaken[index] = currentPerson;
      setSlicesTaken(newSlicesTaken);

      assignSlices(newSlicesTaken, index);
      setCurrentPerson(1);
    }
  };

  const assignSlices = (newSlicesTaken, selectedSlice) => {
    let remainingPersons = persons - 1;
    let currentIndex = selectedSlice;
    let nextPerson = 2;

    const newPersonSlices = { ...personSlices };
    newPersonSlices[currentPerson] = [selectedSlice];

    for (; remainingPersons > 0; remainingPersons--) {
        const direction = nextPerson % 2 === 0 ? -1 : 1;
        let nextIndex = (currentIndex + direction + allSlices.length) % allSlices.length;

        console.log(newSlicesTaken, nextIndex, newSlicesTaken[nextIndex]);

        for (; newSlicesTaken[nextIndex] !== null;) {
            nextIndex = (nextIndex + direction + allSlices.length) % allSlices.length;
        }

        newSlicesTaken[nextIndex] = nextPerson;
        newPersonSlices[nextPerson] = [
            ...(newPersonSlices[nextPerson] || []),
            nextIndex,
        ];
        nextPerson = (nextPerson % persons) + 1;
        currentIndex = nextIndex;
    }

    setSlicesTaken(newSlicesTaken);
    setPersonSlices(newPersonSlices);
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "persons") {
      const newPersons = parseInt(value);
      console.log("new persons added" + newPersons);
      if (!isNaN(newPersons) && newPersons > 0) {
        setPersons(newPersons);
        setAllSlices(
          new Array(newPersons * slicesPerPerson).fill(
            100 / (newPersons * slicesPerPerson)
          )
        );
      } else {
        setPersons(0);
        setAllSlices([]);
      }
    } else if (name === "slices") {
      const newSlicesPerson = parseInt(value);
      if (!isNaN(newSlicesPerson) && newSlicesPerson > 0) {
        setSlicesPerPerson(newSlicesPerson);
        setAllSlices(
          new Array(persons * newSlicesPerson).fill(
            100 / (persons * newSlicesPerson)
          )
        );
      } else {
        setSlicesPerPerson(0);
        setAllSlices([]);
      }
    }
    redistributeSlices();
  };

  const getPizzaDimensions = () => {
    const totalSlices = persons * slicesPerPerson;
    if (totalSlices <= 6) return { width: 250, height: 300 };
    if (totalSlices <= 8) return { width: 280, height: 300 };
    if (totalSlices <= 10) return { width: 300, height: 300 };
    if (totalSlices <= 12) return { width: 320, height: 300 };
    if (totalSlices <= 24) return { width: 350, height: 300 };
    return { width: 400, height: 400 };
  };

  const renderPizzaChart = () => {
    const { width, height } = getPizzaDimensions();
    const totalValue = inputType === "degrees" ? 360 : 100;
    const totalSlices = allSlices.length;

    let startAngle = 0;
    const pizzaSlices = allSlices.map((slice, index) => {
      const sliceValue = (slice / totalValue) * 360;
      const endAngle = startAngle + sliceValue;
      const pathData = describeArc(
        width / 2,
        height / 2,
        width / 3,
        startAngle,
        endAngle
      );
      const isTaken = slicesTaken[index];
      const className = isTaken ? "taken-slice" : "available-slice";

      startAngle = endAngle;

      return (
        <CSSTransition key={index} timeout={500} classNames="slice">
          <path
            key={index}
            d={pathData}
            className={className}
            onClick={() => handleSliceClick(index)}
            stroke="white"
            strokeWidth="0.5"
            fill={
              isTaken
                ? "#f7ecd8"
                : `url(#${
                    selectedPizza === "Pepperoni"
                      ? "pepperoni-pattern"
                      : "margherita-pattern"
                  })`
            }
            style={{ cursor: isTaken ? "default" : "pointer" }}
          />
        </CSSTransition>
      );
    });

    setPizzaSlices(pizzaSlices);
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `L ${x} ${y}`,
      "Z",
    ].join(" ");

    return d;
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    const x = centerX + radius * Math.cos(angleInRadians);
    const y = centerY + radius * Math.sin(angleInRadians);
    return { x, y };
  };

  const getPizzaSize = () => {
    const totalSlices = persons * slicesPerPerson;

    const pizzaSize = [
      { maxSlices: 6, size: "Small Pizza" },
      { maxSlices: 8, size: "Medium Pizza" },
      { maxSlices: 10, size: "Large Pizza" },
      { maxSlices: 12, size: "Extra-Large Pizza" },
      { maxSlices: 24, size: "Party Pizza" },
    ];

    const size = pizzaSize.find(({ maxSlices }) => totalSlices <= maxSlices);
    const sizeName = size?.size ?? "Unknown Pizza Size";
    return sizeName;
  };

  const calculateSlicesPerPerson = () => {
    const slicesValuesPerPerson = {};

    Object.entries(slicesTaken).forEach(([index, person]) => {
      if (person) {
        const sliceValue = allSlices[index];
        if (!slicesValuesPerPerson[person]) {
          slicesValuesPerPerson[person] = sliceValue;
        } else {
          slicesValuesPerPerson[person] += sliceValue;
        }
      }
    });
    return slicesValuesPerPerson;
  };

  const calculateSymmetryAndFairness = () => {
    const slicesValuesPerPerson = calculateSlicesPerPerson();
    const values = Object.values(slicesValuesPerPerson);

    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    setSymmetryScore(mean / Math.max(...values));
    setFairnessMetrics({ mean, stdDev });
  };

  const checkAllSlicesTaken = () => {
    const allTaken = Object.values(slicesTaken).every(
      (slice) => slice !== null
    );
    setAllSlicesTaken(allTaken);
  };

  const renderPersonSlicesWithValues = () => {
    const slicesValuesPerPerson = calculateSlicesPerPerson();
    const totalPizza = allSlices.reduce((acc, curr) => acc + curr, 0);

    return Object.entries(personSlices).map(([person, _]) => {
      let startAngle = 0;
      let endAngle = 0;
      const totalPercent = allSlices.reduce((acc, curr) => acc + curr, 0);

      const personSlicesPaths = allSlices.map((slice, index) => {
        endAngle = startAngle + (slice / totalPercent) * 360;
        const pathData = describeArc(50, 50, 40, startAngle, endAngle);
        const isTaken = slicesTaken[index];

        startAngle = endAngle;
        return (
          <path
            key={index}
            d={pathData}
            fill={
              isTaken === parseInt(person)
                ? `url(#${
                    selectedPizza === "Pepperoni"
                      ? "small-pepperoni-pattern"
                      : "margherita-pattern"
                  })`
                : "#f7ecd8"
            }
            stroke="#fff"
            strokeWidth="0.5"
          />
        );
      });

      const personSliceValue = slicesValuesPerPerson[person] || 0;
      const percentageOfPizza = (personSliceValue / totalPizza) * 100;

      return (
        <div key={person} className="person-slices">
          <h4>
            {customNames && names[person - 1]
              ? names[person - 1]
              : `Person ${person}`}{" "}
            : {percentageOfPizza.toFixed(2)}%
          </h4>

          <svg width="100" height="100">
            <pattern
              id="small-pepperoni-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
              version="1.1"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <g>
                <path
                  style={{ fill: "#E6AE7C" }}
                  d="M511.996,255.996C511.996,397.388,397.384,512,256,512C114.612,512,0,397.388,0,255.996 C0,114.613,114.612,0,256,0C397.384,0,511.996,114.613,511.996,255.996z"
                />
                <path
                  style={{ fill: "#F1BB6C" }}
                  d="M256,463.708c-114.531,0-207.711-93.17-207.711-207.712c0-114.527,93.18-207.704,207.711-207.704 c114.542,0,207.711,93.177,207.711,207.704C463.711,370.538,370.542,463.708,256,463.708z"
                />
                <path
                  style={{ fill: "#E7AD61" }}
                  d="M54.107,264.725c0-114.534,93.18-207.711,207.707-207.711c70.213,0,132.355,35.056,169.969,88.541 C394.984,87.185,329.97,48.293,256,48.293c-114.531,0-207.711,93.177-207.711,207.704c0,44.321,13.996,85.414,37.738,119.17 C65.842,343.153,54.107,305.296,54.107,264.725z"
                />
                <path
                  style={{ fill: "#EE7D5A" }}
                  d="M196.844,150.298c0,19.278-15.628,34.913-34.9,34.913c-19.282,0-34.917-15.635-34.917-34.913 c0-19.279,15.636-34.907,34.917-34.907C181.215,115.391,196.844,131.02,196.844,150.298z"
                />
                <path
                  style={{ fill: "#EE7D5A" }}
                  d="M384.969,384.98c0,20.085-16.271,36.364-36.357,36.364c-20.085,0-36.37-16.279-36.37-36.364 c0-20.086,16.285-36.364,36.37-36.364C368.698,348.617,384.969,364.895,384.969,384.98z"
                />
                <path
                  style={{ fill: "#EE7D5A" }}
                  d="M162.915,318.053c0,19.285-15.642,34.914-34.917,34.914c-19.278,0-34.906-15.629-34.906-34.914 c0-19.271,15.628-34.906,34.906-34.906C147.273,283.147,162.915,298.782,162.915,318.053z"
                />
                <path
                  style={{ fill: "#EE7D5A" }}
                  d="M421.826,203.633c0,16.057-13.029,29.085-29.1,29.085c-16.057,0-29.086-13.028-29.086-29.085 c0-16.064,13.028-29.093,29.086-29.093C408.798,174.54,421.826,187.569,421.826,203.633z"
                />
                <path
                  style={{ fill: "#EE7D5A" }}
                  d="M294.314,287.989c0,13.121-10.628,23.757-23.757,23.757c-13.114,0-23.757-10.636-23.757-23.757 c0-13.122,10.643-23.757,23.757-23.757C283.686,264.232,294.314,274.868,294.314,287.989z"
                />
                <g>
                  <path
                    style={{ fill: "#D9A988" }}
                    d="M197.83,332.61c0,4.014-3.257,7.271-7.272,7.271c-4.028,0-7.286-3.257-7.286-7.271 c0-4.022,3.258-7.272,7.286-7.272C194.573,325.338,197.83,328.588,197.83,332.61z"
                  />
                  <circle
                    style={{ fill: "#D9A988" }}
                    cx="121.7"
                    cy="241.454"
                    r="7.273"
                  />
                  <path
                    style={{ fill: "#D9A988" }}
                    d="M275.385,204.612c0,4.014-3.243,7.271-7.271,7.271c-4.015,0-7.272-3.257-7.272-7.271 c0-4.022,3.257-7.279,7.272-7.279C272.142,197.333,275.385,200.59,275.385,204.612z"
                  />
                  <path
                    style={{ fill: "#D9A988" }}
                    d="M349.085,318.06c0,4.021-3.257,7.278-7.272,7.278c-4.014,0-7.271-3.257-7.271-7.278 c0-4.014,3.257-7.271,7.271-7.271C345.828,310.789,349.085,314.046,349.085,318.06z"
                  />
                  <path
                    style={{ fill: "#D9A988" }}
                    d="M290.428,425.701c0,4.014-3.257,7.271-7.271,7.271c-4.014,0-7.271-3.257-7.271-7.271 c0-4.021,3.257-7.278,7.271-7.278C287.171,418.423,290.428,421.68,290.428,425.701z"
                  />
                  <path
                    style={{ fill: "#D9A988" }}
                    d="M378.67,131.884c0,4.014-3.257,7.271-7.272,7.271c-4.014,0-7.271-3.257-7.271-7.271 c0-4.021,3.257-7.278,7.271-7.278C375.413,124.606,378.67,127.863,378.67,131.884z"
                  />
                  <path
                    style={{ fill: "#D9A988" }}
                    d="M212.858,93.092c0,4.014-3.257,7.271-7.272,7.271c-4.029,0-7.286-3.257-7.286-7.271 c0-4.021,3.257-7.272,7.286-7.272C209.601,85.82,212.858,89.071,212.858,93.092z"
                  />
                  <path
                    style={{ fill: "#D9A988" }}
                    d="M411.641,340.367c0,4.014-3.257,7.271-7.271,7.271c-4.029,0-7.272-3.257-7.272-7.271 c0-4.021,3.243-7.278,7.272-7.278C408.384,333.089,411.641,336.345,411.641,340.367z"
                  />
                </g>
                <path
                  style={{ fill: "#F6DABF" }}
                  d="M304.113,128.87c3.029-11.186-7.971-25.985-25.242-30.679c-17.272-4.678-34.257,2.522-37.286,13.708 c-1.7,6.257,1.857,10.507,8.343,13.857l-3.572,13.136c-1.143,4.25,1.357,8.628,5.6,9.778l24.599,6.679 c4.258,1.15,8.629-1.357,9.786-5.6l3.572-13.15C297.199,136.991,302.414,135.127,304.113,128.87z"
                />
                <path
                  style={{ fill: "#F6DABF" }}
                  d="M234.401,352.324c-12.743-4.957-31.485,6.107-39.128,25.778 c-7.657,19.678-1.329,40.492,11.414,45.456c7.128,2.771,12.557-0.864,17.299-8.057l14.958,5.814 c4.857,1.886,10.3-0.508,12.171-5.35l10.914-28.028c1.872-4.835-0.528-10.285-5.357-12.164l-14.971-5.829 C243.058,361.452,241.529,355.088,234.401,352.324z"
                />
                <path
                  style={{ fill: "#F6DABF" }}
                  d="M390.669,313.824c8.257,0.086,16.485-10.178,16.6-22.921c0.129-12.757-7.899-23.164-16.156-23.242 c-4.615-0.051-6.915,3.171-8.057,8.242l-9.7-0.093c-3.128-0.029-5.7,2.486-5.729,5.622l-0.171,18.171 c-0.029,3.128,2.485,5.7,5.615,5.729l9.714,0.093C383.827,310.524,386.041,313.781,390.669,313.824z"
                />
                <polygon
                  style={{ fill: "#EA8C71" }}
                  points="202.415,249.454 168.13,233.475 176.744,215.026 211.015,230.997"
                />
                <polygon
                  style={{ fill: "#EA8C71" }}
                  points="352.898,171.462 322.471,193.919 310.385,177.526 340.813,155.077"
                />
                <polygon
                  style={{ fill: "#EA8C71" }}
                  points="144.612,388.138 166.173,404.816 157.187,416.423 135.637,399.738"
                />
              </g>
            </pattern>
            {personSlicesPaths}
          </svg>
          {Object.keys(costsPerPerson).length > 0 && (
            <p>Pays: {costsPerPerson[person]?.toFixed(2)}€</p>
          )}
        </div>
      );
    });
  };

  const handleNamesChange = (index, value) => {
    const updatedNames = [...names];
    updatedNames[index] = value;
    setNames(updatedNames);
  };

  const calculateCostsPerPerson = () => {
    const slicesValuesPerPerson = calculateSlicesPerPerson();
    const pizzaSize = getPizzaSize();
    const pizzaPrice = getPizzaPrice(selectedPizza, pizzaSize);
    const totalSlices = Object.values(slicesValuesPerPerson).reduce(
      (total, value) => total + value,
      0
    );

    const costs = {};

    Object.entries(slicesValuesPerPerson).forEach(([person, slicesValue]) => {
      const percentage = (slicesValue / totalSlices) * 100;
      const cost = (percentage / 100) * pizzaPrice;
      costs[person] = cost;
    });

    setCostsPerPerson(costs);
  };

  const toggleCustomNames = () => {
    setCustomNames(!customNames);
    if (!customNames) {
      setNames(new Array(persons).fill(null));
    } else {
      setNames([]);
    }
  };

  const redistributeSlices = () => {
    const initialSlicesTaken = {};
    for (let i = 0; i < persons * slicesPerPerson; i++) {
      initialSlicesTaken[i] = null;
    }
    setSlicesTaken(initialSlicesTaken);
    setPersonSlices({});
    setCostsPerPerson({});
    setAllSlicesTaken(false);
  };

  const handleSelectPizza = (e) => {
    setSelectedPizza(e.target.value);
    redistributeSlices();
  };
  return (
    <div className="App">
      <div className="title-container">
        <h1 className="game-title">Slice it Right</h1>
      </div>
      <div className="all-inputs">
        <div className="all-inputs2">
          <div className="input-section">
            <div className="inline-inputs">
              <label>
                Number of Persons:
                <input
                  type="number"
                  name="persons"
                  value={persons}
                  onChange={handleInputChange}
                  min={1}
                />
              </label>
              <label>
                Slices Per Person:
                <input
                  type="number"
                  name="slices"
                  value={slicesPerPerson}
                  onChange={handleInputChange}
                  min={1}
                />
              </label>
            </div>
          </div>
          <div className="left">
            <label className="checkbox-label">
              Use Custom Names:
              <input
                type="checkbox"
                checked={customNames}
                onChange={toggleCustomNames}
              />
              <span className="custom-checkbox"></span>
            </label>
            {customNames && (
              <div className="person-names-container">
                {Array.from({ length: persons }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Person ${i + 1}`}
                    value={names[i] || ""}
                    onChange={(e) => handleNamesChange(i, e.target.value)}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <label>
              Pizza Type:
              <select value={selectedPizza} onChange={handleSelectPizza}>
                <option value="Pepperoni">Pepperoni</option>
                <option value="margherita">Margherita</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              The pizza is divide into equal parts. You can customize it by
              specifying the sizes of {persons * slicesPerPerson} slices.
              <br></br>
              <select onChange={handleInputType}>
                <option value="degrees">Sizes in degrees</option>
                <option value="percentages">Sizes in percentages</option>
              </select>
              <input
                type="text"
                onChange={handleInputValues}
                placeholder="comma-separated"
              />
              {error && <p style={{ color: "red" }}>{error}</p>}
            </label>
          </div>
          <button onClick={handleSubmit} className="divide-button">
            Divide Pizza
          </button>
        </div>
      </div>

      <div className="pizza-chart">
        <svg
          viewBox={`0 0 ${getPizzaDimensions().width} ${
            getPizzaDimensions().height
          }`}
          width={getPizzaDimensions().width}
          height={getPizzaDimensions().height}
        >
          <defs>
            <pattern
              id="pepperoni-pattern"
              patternUnits="userSpaceOnUse"
              width={getPizzaDimensions().width}
              height={getPizzaDimensions().height}
              version="1.1"
              viewBox="0 0 380 400"
            >
              <g>
                <path
                  style={{ fill: "#E6AE7C", transform: "scale(0.8)" }}
                  d="M511.996,255.996C511.996,397.388,397.384,512,256,512C114.612,512,0,397.388,0,255.996 C0,114.613,114.612,0,256,0C397.384,0,511.996,114.613,511.996,255.996z"
                />
                <path
                  style={{ fill: "#F1BB6C", transform: "scale(0.8)" }}
                  d="M256,463.708c-114.531,0-207.711-93.17-207.711-207.712c0-114.527,93.18-207.704,207.711-207.704 c114.542,0,207.711,93.177,207.711,207.704C463.711,370.538,370.542,463.708,256,463.708z"
                />
                <path
                  style={{ fill: "#EE7D5A", transform: "scale(0.8)" }}
                  d="M196.844,150.298c0,19.278-15.628,34.913-34.9,34.913c-19.282,0-34.917-15.635-34.917-34.913 c0-19.279,15.636-34.907,34.917-34.907C181.215,115.391,196.844,131.02,196.844,150.298z"
                />
                <path
                  style={{ fill: "#EE7D5A", transform: "scale(0.8)" }}
                  d="M384.969,384.98c0,20.085-16.271,36.364-36.357,36.364c-20.085,0-36.37-16.279-36.37-36.364 c0-20.086,16.285-36.364,36.37-36.364C368.698,348.617,384.969,364.895,384.969,384.98z"
                />
                <path
                  style={{ fill: "#EE7D5A", transform: "scale(0.8)" }}
                  d="M162.915,318.053c0,19.285-15.642,34.914-34.917,34.914c-19.278,0-34.906-15.629-34.906-34.914 c0-19.271,15.628-34.906,34.906-34.906C147.273,283.147,162.915,298.782,162.915,318.053z"
                />
                <path
                  style={{ fill: "#EE7D5A", transform: "scale(0.8)" }}
                  d="M421.826,203.633c0,16.057-13.029,29.085-29.1,29.085c-16.057,0-29.086-13.028-29.086-29.085 c0-16.064,13.028-29.093,29.086-29.093C408.798,174.54,421.826,187.569,421.826,203.633z"
                />
                <path
                  style={{ fill: "#EE7D5A", transform: "scale(0.8)" }}
                  d="M294.314,287.989c0,13.121-10.628,23.757-23.757,23.757c-13.114,0-23.757-10.636-23.757-23.757 c0-13.122,10.643-23.757,23.757-23.757C283.686,264.232,294.314,274.868,294.314,287.989z"
                />
                <path
                  style={{ fill: "#F6DABF", transform: "scale(0.8)" }}
                  d="M304.113,128.87c3.029-11.186-7.971-25.985-25.242-30.679c-17.272-4.678-34.257,2.522-37.286,13.708 c-1.7,6.257,1.857,10.507,8.343,13.857l-3.572,13.136c-1.143,4.25,1.357,8.628,5.6,9.778l24.599,6.679 c4.258,1.15,8.629-1.357,9.786-5.6l3.572-13.15C297.199,136.991,302.414,135.127,304.113,128.87z"
                />
                <path
                  style={{ fill: "#F6DABF", transform: "scale(0.8)" }}
                  d="M234.401,352.324c-12.743-4.957-31.485,6.107-39.128,25.778 c-7.657,19.678-1.329,40.492,11.414,45.456c7.128,2.771,12.557-0.864,17.299-8.057l14.958,5.814 c4.857,1.886,10.3-0.508,12.171-5.35l10.914-28.028c1.872-4.835-0.528-10.285-5.357-12.164l-14.971-5.829 C243.058,361.452,241.529,355.088,234.401,352.324z"
                />
                <path
                  style={{ fill: "#F6DABF", transform: "scale(0.8)" }}
                  d="M390.669,313.824c8.257,0.086,16.485-10.178,16.6-22.921c0.129-12.757-7.899-23.164-16.156-23.242 c-4.615-0.051-6.915,3.171-8.057,8.242l-9.7-0.093c-3.128-0.029-5.7,2.486-5.729,5.622l-0.171,18.171 c-0.029,3.128,2.485,5.7,5.615,5.729l9.714,0.093C383.827,310.524,386.041,313.781,390.669,313.824z"
                />
                <polygon
                  style={{ fill: "#EA8C71", transform: "scale(0.8)" }}
                  points="202.415,249.454 168.13,233.475 176.744,215.026 211.015,230.997"
                />
                <polygon
                  style={{ fill: "#EA8C71", transform: "scale(0.8)" }}
                  points="352.898,171.462 322.471,193.919 310.385,177.526 340.813,155.077"
                />
                <polygon
                  style={{ fill: "#EA8C71", transform: "scale(0.8)" }}
                  points="144.612,388.138 166.173,404.816 157.187,416.423 135.637,399.738"
                />
                <g>
                  <path
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    d="M197.83,332.61c0,4.014-3.257,7.271-7.272,7.271c-4.028,0-7.286-3.257-7.286-7.271 c0-4.022,3.258-7.272,7.286-7.272C194.573,325.338,197.83,328.588,197.83,332.61z"
                  />
                  <circle
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    cx="121.7"
                    cy="241.454"
                    r="7.273"
                  />
                  <path
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    d="M275.385,204.612c0,4.014-3.243,7.271-7.271,7.271c-4.015,0-7.272-3.257-7.272-7.271 c0-4.022,3.257-7.279,7.272-7.279C272.142,197.333,275.385,200.59,275.385,204.612z"
                  />
                  <path
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    d="M349.085,318.06c0,4.021-3.257,7.278-7.272,7.278c-4.014,0-7.271-3.257-7.271-7.278 c0-4.014,3.257-7.271,7.271-7.271C345.828,310.789,349.085,314.046,349.085,318.06z"
                  />
                  <path
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    d="M290.428,425.701c0,4.014-3.257,7.271-7.271,7.271c-4.014,0-7.271-3.257-7.271-7.271 c0-4.021,3.257-7.278,7.271-7.278C287.171,418.423,290.428,421.68,290.428,425.701z"
                  />
                  <path
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    d="M378.67,131.884c0,4.014-3.257,7.271-7.272,7.271c-4.014,0-7.271-3.257-7.271-7.271 c0-4.021,3.257-7.278,7.271-7.278C375.413,124.606,378.67,127.863,378.67,131.884z"
                  />
                  <path
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    d="M212.858,93.092c0,4.014-3.257,7.271-7.272,7.271c-4.029,0-7.286-3.257-7.286-7.271 c0-4.021,3.257-7.272,7.286-7.272C209.601,85.82,212.858,89.071,212.858,93.092z"
                  />
                  <path
                    style={{ fill: "#afb881", transform: "scale(0.8)" }}
                    d="M411.641,340.367c0,4.014-3.257,7.271-7.271,7.271c-4.029,0-7.272-3.257-7.272-7.271 c0-4.021,3.243-7.278,7.272-7.278C408.384,333.089,411.641,336.345,411.641,340.367z"
                  />
                </g>
              </g>
            </pattern>

            <pattern
              id="margherita-pattern"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <rect width="100" height="100" fill="#F1BB6C" />
            </pattern>
          </defs>
          <TransitionGroup component={null}>{pizzaSlices}</TransitionGroup>
        </svg>
        <div></div>
        <div className="teksti">
          <p className="pizza-size-style">
            {selectedPizza} {getPizzaSize()} costs{" "}
            {getPizzaPrice(selectedPizza, getPizzaSize())}€.
          </p>
        </div>
      </div>

      <div className="persons-slices-container">
        {renderPersonSlicesWithValues()}
      </div>
      <div>
        <button onClick={redistributeSlices} className="reset-button">
          Reset the taken slices
        </button>
        <div className="info-icon" onClick={togglePopup}>
          testt
        </div>
      </div>
      <div className="analysis">
        <h3>🍕 Pizza Distribution Analysis 📊</h3>
        <div className="metric">
          <h4>
            Symmetry Score: {symmetryScore ? symmetryScore.toFixed(2) : " "}
          </h4>
          <p>
            <strong>Description:</strong> The symmetry score measures how evenly
            the pizza slices are distributed among the people. A higher score
            indicates a more even distribution.
          </p>
        </div>
        <div className="metric">
          <h4>Fairness Metrics:</h4>
          <p>
            <strong>Mean:</strong>{" "}
            {fairnessMetrics.mean ? fairnessMetrics.mean.toFixed(2) : " "}
            <br />
            <strong>Description:</strong> The mean represents the average amount
            of pizza each person receives. It helps assess the fairness of the
            distribution.
          </p>
          <p>
            <strong>Standard Deviation:</strong>{" "}
            {fairnessMetrics.stdDev ? fairnessMetrics.stdDev.toFixed(2) : " "}
            <br />
            <strong>Description:</strong> The standard deviation measures how
            much the slice sizes deviate from the mean. Lower values indicate a
            more consistent distribution.
          </p>
        </div>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={togglePopup}>
              ×
            </span>
            <h4>
              Here are some instructions that might help you with the game and
              its rules
            </h4>
            <br></br>

            <b>Setup:</b>
            <ul>
              <li>Enter the number of persons and slices per person.</li>
              <li>Select pizza type, either Pepperoni or Margherita.</li>
              <li>
                Choose whether to divide the pizza using degrees or percentages.
              </li>
              <li>Enter the sizes for each slice separated by commas.</li>
              <li>
                Click "Divide Pizza" to distribute the slices among the selected
                number of persons.{" "}
              </li>
            </ul>
            <br></br>
            <b>Interaction:</b>
            <p>
              <ul>
                <li>
                  {" "}
                  Click on any available slice<br></br>
                </li>
                <li>
                  {" "}
                  This part you choose will be assigned to the first person,
                  <br></br>
                </li>
                <li> Then the game follows a rule which is:</li>
                <ol>
                  <li>
                    Even persons will take the free slice on the
                    counter-clockwise side
                  </li>
                  <li>
                    Odd persons will take the free slice on the clockwise side
                  </li>
                </ol>
              </ul>
            </p>
            <br></br>

            <b>Metrics: </b>
            <br></br>

            <p>
              <li>
                Review symmetry score and fairness metrics to see how evenly the
                pizza slices are distributed.
              </li>
            </p>
            <br></br>
            <br></br>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
