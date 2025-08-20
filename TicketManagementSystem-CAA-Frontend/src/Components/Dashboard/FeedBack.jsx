import React, { useState } from "react";

// FeedbackCard Component
const FeedbackCard = ({
  mainQuestion,
  subQuestion,
  options,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <div className="relative w-full mx-auto select-none rounded-lg border border-gray-200 p-6 shadow-lg bg-white">
      <p className="text-xl font-bold text-gray-900 dark:text-white">
        {mainQuestion}
      </p>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{subQuestion}</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 right-0 m-4 h-6 w-6 text-gray-500 dark:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {options.map((option) => (
          <div
            key={option}
            onClick={() => onSelectOption(option)}
            className={`flex h-12 w-full cursor-pointer items-center justify-center rounded-md font-bold ${
              selectedOption === option
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
            }`}
          >
            {option}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
        <p>Not satisfied</p>
        <p>Very satisfied</p>
      </div>
    </div>
  );
};

// FeedBack Component
export const FeedBack = () => {
  // Initialize state to store the selected option for each question
  const [feedback, setFeedback] = useState([
    { mainQuestion: "Question 1", selectedOption: null },
    { mainQuestion: "Question 2", selectedOption: null },
    { mainQuestion: "Question 3", selectedOption: null },
    { mainQuestion: "Question 4", selectedOption: null },
    { mainQuestion: "Question 5", selectedOption: null },
    { mainQuestion: "Question 6", selectedOption: null },
  ]);

  // Handle option selection
  const handleOptionSelect = (index, option) => {
    const newFeedback = [...feedback];
    newFeedback[index].selectedOption = option;
    setFeedback(newFeedback);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Example: log the feedback to the console
    console.log("Submitted Feedback:", feedback);

    // Here, you can add code to send the feedback to an API endpoint
  };

  const questions = [
    {
      mainQuestion: "Question 1",
      subQuestion:
        "How clear and understandable was the information provided about the complaint process?",
      options: [1, 2, 3, 4, 5],
    },
    {
      mainQuestion: "Question 2",
      subQuestion:
        "How satisfied are you with the response time to your complaint?",
      options: [1, 2, 3, 4, 5],
    },
    {
      mainQuestion: "Question 3",
      subQuestion:
        "How satisfied are you with the resolution provided for your complaint?",
      options: [1, 2, 3, 4, 5],
    },
    {
      mainQuestion: "Question 4",
      subQuestion:
        "How would you rate your overall experience with the complaint management system?",
      options: [1, 2, 3, 4, 5],
    },
    {
      mainQuestion: "Question 5",
      subQuestion:
        "How effective was the communication during the complaint process?",
      options: [1, 2, 3, 4, 5],
    },
    {
      mainQuestion: "Question 6",
      subQuestion:
        "How easy was it to navigate and use the complaint management system?",
      options: [1, 2, 3, 4, 5],
    },
  ];

  return (
    <div className="p-6 flex items-start flex-col bg-white m-4 rounded-lg">
      <h2 className="text-2xl font-semibold font-inherit text-gray-800 mb-6">
        FeedBack
      </h2>
      <div className="grid gap-6 md:grid-cols-1 w-full">
        {questions.map((q, index) => (
          <FeedbackCard
            key={index}
            mainQuestion={q.mainQuestion}
            subQuestion={q.subQuestion}
            options={q.options}
            selectedOption={feedback[index].selectedOption}
            onSelectOption={(option) => handleOptionSelect(index, option)}
          />
        ))}
        <div className="">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
