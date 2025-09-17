import "./App.css";
import { clsx } from "clsx";
import { useState, useEffect, useMemo } from "react";

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

function App() {
  const [londonTime, setLondonTime] = useState(new Date());
  const [sydneyTime, setSydneyTime] = useState(new Date());

  const [showLondonOnLeft, setShowLondonOnLeft] = useState(true);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLondonTime(getZonedDate("Europe/London"));
      setSydneyTime(getZonedDate("Australia/Sydney"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      },
      {
        city: "Sydney",
        current: formatTime(sydneyTime, "Australia/Sydney"),
        timezone: "Australia/Sydney",
      },
    ],
    [londonTime, sydneyTime]
  );

  // Data for the 24-hour conversion table
  const twentyFourHourData = useMemo(() => {
    const dates: Date[] = [];

    const baseDate = new Date();
    // Get the base date for a fixed reference point, e.g., midnight
    baseDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
      const date = new Date(baseDate);
      date.setHours(i);

      dates.push(date);
    }
    return dates;
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100 p-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center text-balance text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          London ↔ Sydney Time Converter
        </h1>
        {/* <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          View the live time in London and Sydney, and convert times between
          them instantly.
        </p> */}

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 24-Hour Conversion Table */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-12 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-2xl text-balance font-bold text-gray-200">
              24-Hour Time Conversion
            </h2>
            <button
              onClick={handleToggleColumns}
              className="py-2 px-2 md:px-4 rounded-lg font-semibold text-gray-900 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg text-sm"
            >
              Toggle Columns
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr className="top-0">
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  {showLondonOnLeft ? "London Time" : "Sydney Time"}
                </th>
                <th className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  {showLondonOnLeft ? "Sydney Time" : "London Time"}
                </th>
              </tr>
            </thead>
            <tbody>
              {twentyFourHourData.map((date, index) => {
                const hourFrom24 = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Europe/London",
                    }).format(date)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Australia/Sydney",
                    }).format(date);

                const hourTo24 = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Australia/Sydney",
                    }).format(date)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: false,
                      timeZone: "Europe/London",
                    }).format(date);

                const hourFromLabel = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Europe/London",
                    }).format(date)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Australia/Sydney",
                    }).format(date);

                const hourToLabel = showLondonOnLeft
                  ? new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Australia/Sydney",
                    }).format(date)
                  : new Intl.DateTimeFormat(navigator.language, {
                      hour: "numeric",
                      hour12: true,
                      timeZone: "Europe/London",
                    }).format(date);

                return (
                  <tr
                    key={index}
                    className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td
                      className={clsx(
                        "p-4 whitespace-nowrap text-gray-200 text-sm",
                        {
                          "bg-gradient-to-tl to-25% from-emerald-700 to-sky-950 text-gray-200":
                            timesOfDay.night.includes(
                              Number.parseInt(hourFrom24)
                            ),
                          "bg-gradient-to-tl to-25% from-amber-200 to-sky-200 text-gray-800":
                            timesOfDay.workingDay.includes(
                              Number.parseInt(hourFrom24)
                            ),
                          "bg-gradient-to-tl to-25% from-amber-700 to-sky-700 text-gray-200":
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
                          "bg-gradient-to-tl to-25% from-emerald-700 to-sky-950 text-gray-200":
                            timesOfDay.night.includes(
                              Number.parseInt(hourTo24)
                            ),
                          "bg-gradient-to-tl to-25% from-amber-200 to-sky-200 text-gray-800":
                            timesOfDay.workingDay.includes(
                              Number.parseInt(hourTo24)
                            ),
                          "bg-gradient-to-tl to-25% from-amber-700 to-sky-700 text-gray-200":
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

        <footer className="text-gray-500 mt-12 text-sm">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Legend
          </h2>
          <dl className="flex gap-2 justify-start w-fit text-gray-50">
            <dt>
              <i className="bg-gradient-to-tl to-25% from-emerald-700 to-sky-950 text-gray-200 aspect-square block size-5" />
              <span className="sr-only">Dark Blue</span>
            </dt>
            <dd className="me-4">Night</dd>
            <dt>
              <i className="bg-gradient-to-tl to-25% from-amber-700 to-sky-700 text-gray-200 aspect-square block size-5" />
              <span className="sr-only">Medium Blue</span>
            </dt>
            <dd className="me-4">Evening</dd>
            <dt>
              <i className="bg-gradient-to-tl t4-50% from-amber-200 to-sky-200 text-gray-800 aspect-square block size-5" />
              <span className="sr-only">Light Blue</span>
            </dt>
            <dd className="me-4">Working Hours</dd>
          </dl>
        </footer>
      </div>
    </div>
  );
}

export default App;
