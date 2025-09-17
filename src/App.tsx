import "./App.css";
import { clsx } from "clsx";
import { useState, useEffect, useMemo } from "react";

// const inRange = (num: number, min: number, max: number) =>
//   num >= min && num <= max;

const timesOfDay = {
  night: [0, 1, 2, 3, 4, 5, 6, 7],
  workingDay: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  evening: [18, 19, 20, 21, 22, 23],
};

// Helper function to format the time
const formatTime = (date: Date, timezone: string): string => {
  return new Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: timezone,
  }).format(date);
};

// Helper function to get the current date for a timezone
const getZonedDate = (timezone: string): Date => {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  })
    .formatToParts(now)
    .reduce<Record<string, number>>((acc, part) => {
      if (part.type !== "literal" && part.value) {
        acc[part.type] = parseInt(part.value, 10);
      }
      return acc;
    }, {});

  const zonedDate = new Date(now);
  zonedDate.setHours(parts.hour ?? 0);
  zonedDate.setMinutes(parts.minute ?? 0);
  zonedDate.setSeconds(parts.second ?? 0);
  zonedDate.setMilliseconds(0);

  return zonedDate;
};

// Helper function to convert time
const convertTime = (
  time: string,
  sourceTimezone: string,
  targetTimezone: string
): Date | null => {
  try {
    const [h, m, s] = time.split(":").map(Number);
    const baseDate = new Date();

    const dateInSource = new Date(baseDate);
    dateInSource.setHours(h, m, s || 0, 0);

    // Convert to target timezone using formatToParts
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: targetTimezone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    })
      .formatToParts(dateInSource)
      .reduce<Record<string, number>>((acc, part) => {
        if (part.type !== "literal" && part.value) {
          acc[part.type] = parseInt(part.value, 10);
        }
        return acc;
      }, {});

    const converted = new Date(dateInSource);
    converted.setHours(parts.hour ?? 0);
    converted.setMinutes(parts.minute ?? 0);
    converted.setSeconds(parts.second ?? 0);
    converted.setMilliseconds(0);

    return converted;
  } catch (error) {
    console.error("Error converting time:", error);
    return null;
  }
};

function App() {
  const [londonTime, setLondonTime] = useState(new Date());
  const [sydneyTime, setSydneyTime] = useState(new Date());
  const [londonInput, setLondonInput] = useState("");
  const [sydneyInput, setSydneyInput] = useState("");
  const [convertedLondonTime, setConvertedLondonTime] = useState<Date | null>(
    null
  );
  const [convertedSydneyTime, setConvertedSydneyTime] = useState<Date | null>(
    null
  );
  const [showLondonOnLeft, setShowLondonOnLeft] = useState(true);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLondonTime(getZonedDate("Europe/London"));
      setSydneyTime(getZonedDate("Australia/Sydney"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle manual time conversion from London to Sydney
  const handleLondonConvert = () => {
    if (!londonInput) {
      setConvertedSydneyTime(null);
      return;
    }

    const converted = convertTime(
      londonInput,
      "Europe/London",
      "Australia/Sydney"
    );

    if (!converted) {
      throw Error("No converted date set");
    }

    setConvertedSydneyTime(converted);
  };

  // Handle manual time conversion from Sydney to London
  const handleSydneyConvert = () => {
    if (!sydneyInput) {
      setConvertedLondonTime(null);
      return;
    }

    const converted = convertTime(
      sydneyInput,
      "Australia/Sydney",
      "Europe/London"
    );

    if (!converted) {
      throw Error("No converted date set");
    }

    setConvertedLondonTime(converted);
  };

  // Toggle the column order for the 24-hour table
  const handleToggleColumns = () => {
    setShowLondonOnLeft(!showLondonOnLeft);
  };

  // Data for the live time table
  const liveTimeData = useMemo(
    () => [
      {
        city: "London",
        current: formatTime(londonTime, "Europe/London"),
        timezone: "Europe/London",
        conversion: convertedLondonTime
          ? formatTime(convertedLondonTime, "Europe/London")
          : "N/A",
      },
      {
        city: "Sydney",
        current: formatTime(sydneyTime, "Australia/Sydney"),
        timezone: "Australia/Sydney",
        conversion: convertedSydneyTime
          ? formatTime(convertedSydneyTime, "Australia/Sydney")
          : "N/A",
      },
    ],
    [londonTime, sydneyTime, convertedLondonTime, convertedSydneyTime]
  );

  // Data for the 24-hour conversion table
  const twentyFourHourData = useMemo(() => {
    // type HourRow = { londonHour: string; sydneyHour: string };
    // const data: HourRow[] = [];
    type DateRow = { londonDate: Date; sydneyDate: Date };
    const data: DateRow[] = [];

    const baseDate = new Date();
    // Get the base date for a fixed reference point, e.g., midnight
    baseDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
      const londonDate = new Date(baseDate);
      londonDate.setHours(i);

      const sydneyDate = convertTime(
        `${i}:00:00`,
        "Europe/London",
        "Australia/Sydney"
      );

      if (!sydneyDate) {
        throw Error("No date set for Sydney");
      }

      data.push({
        // londonHour: new Intl.DateTimeFormat(navigator.language, {
        //   hour: "numeric",
        //   hour12: true,
        //   timeZone: "Europe/London",
        // }).format(londonDate),
        // sydneyHour: new Intl.DateTimeFormat(navigator.language, {
        //   hour: "numeric",
        //   hour12: true,
        //   timeZone: "Australia/Sydney",
        // }).format(sydneyDate),
        // londonHour: new Intl.DateTimeFormat(navigator.language, {
        //   hour: "numeric",
        //   hour12: false,
        //   timeZone: "Europe/London",
        // }).format(londonDate),
        // sydneyHour: new Intl.DateTimeFormat(navigator.language, {
        //   hour: "numeric",
        //   hour12: false,
        //   timeZone: "Australia/Sydney",
        // }).format(sydneyDate),
        londonDate,
        sydneyDate,
      });
    }
    return data;
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 p-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          World Time Converter
        </h1>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          View the live time in London and Sydney, and convert times between
          them instantly.
        </p>

        {/* Live Time Table */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  City
                </th>
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  Current Time
                </th>
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  Timezone
                </th>
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  Converted Time
                </th>
              </tr>
            </thead>
            <tbody>
              {liveTimeData.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap text-gray-200 text-sm">
                    {row.city}
                  </td>
                  <td className="p-4 whitespace-nowrap text-gray-200 text-sm">
                    {row.current}
                  </td>
                  <td className="p-4 whitespace-nowrap text-gray-200 text-sm">
                    {row.timezone}
                  </td>
                  <td className="p-4 whitespace-nowrap text-gray-200 text-sm">
                    {row.conversion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 24-Hour Conversion Table */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-12 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-200">
              24-Hour Time Conversion
            </h2>
            <button
              onClick={handleToggleColumns}
              className="py-2 px-4 rounded-lg font-semibold text-gray-900 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg text-sm"
            >
              Toggle Columns
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  {showLondonOnLeft ? "London Time" : "Sydney Time"}
                </th>
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  {showLondonOnLeft ? "Sydney Time" : "London Time"}
                </th>
              </tr>
            </thead>
            <tbody>
              {twentyFourHourData.map((row, index) => {
                const hourFrom24 = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Europe/London",
                    }).format(row.londonDate)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Australia/Sydney",
                    }).format(row.sydneyDate);

                const hourTo24 = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Australia/Sydney",
                    }).format(row.sydneyDate)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Europe/London",
                    }).format(row.londonDate);

                const hourFromLabel = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Europe/London",
                    }).format(row.londonDate)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Australia/Sydney",
                    }).format(row.sydneyDate);

                const hourToLabel = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Australia/Sydney",
                    }).format(row.sydneyDate)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Europe/London",
                    }).format(row.londonDate);

                return (
                  <tr
                    key={index}
                    className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td
                      className={clsx(
                        "p-4 whitespace-nowrap text-gray-200 text-sm",
                        {
                          "bg-blue-950 text-gray-200":
                            timesOfDay.night.includes(
                              Number.parseInt(hourFrom24)
                            ),
                          "bg-blue-200 text-gray-800":
                            timesOfDay.workingDay.includes(
                              Number.parseInt(hourFrom24)
                            ),
                          "bg-blue-700 text-gray-200":
                            timesOfDay.evening.includes(
                              Number.parseInt(hourFrom24)
                            ),
                        }
                      )}
                    >
                      {hourFromLabel}
                    </td>
                    <td
                      className={clsx(
                        "p-4 whitespace-nowrap text-gray-200 text-sm",
                        {
                          "bg-blue-950 text-gray-200":
                            timesOfDay.night.includes(
                              Number.parseInt(hourTo24)
                            ),
                          "bg-blue-200 text-gray-800":
                            timesOfDay.workingDay.includes(
                              Number.parseInt(hourTo24)
                            ),
                          "bg-blue-700 text-gray-200":
                            timesOfDay.evening.includes(
                              Number.parseInt(hourTo24)
                            ),
                        }
                      )}
                    >
                      {hourToLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Manual Time Conversion Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* London to Sydney Conversion */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-400">
                Convert from London
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="london-time"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Enter a time (HH:MM:SS)
                </label>
                <input
                  id="london-time"
                  type="text"
                  value={londonInput}
                  onChange={(e) => setLondonInput(e.target.value)}
                  placeholder="e.g., 14:30:00"
                  className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
              </div>
              <button
                onClick={handleLondonConvert}
                className="w-full py-2 px-4 rounded-lg font-bold text-gray-900 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Convert to Sydney
              </button>
            </div>
          </div>

          {/* Sydney to London Conversion */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-pink-400">
                Convert from Sydney
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="sydney-time"
                  className="block text-sm font-medium text-gray-400 mb-1"
                >
                  Enter a time (HH:MM:SS)
                </label>
                <input
                  id="sydney-time"
                  type="text"
                  value={sydneyInput}
                  onChange={(e) => setSydneyInput(e.target.value)}
                  placeholder="e.g., 22:00:00"
                  className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
              <button
                onClick={handleSydneyConvert}
                className="w-full py-2 px-4 rounded-lg font-bold text-gray-900 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Convert to London
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-500 mt-12 text-sm">
          Built with React
        </footer>
      </div>
    </div>
  );
}

export default App;
