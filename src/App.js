import { useEffect } from "react";
import { useState } from "react";

const cityDetails = {
  Makkah: ["SA", "مكة المكرمة"],
  Madina: ["SA", "المدينة المنورة"],
  Algeria: ["DZ", "الجزائر"],
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState("Makkah");
  const [displayedCity, setDisplayedCity] = useState(
    cityDetails[selectedCity].at(1)
  );

  const country = cityDetails[selectedCity].at(0);
  const [timings, setTimings] = useState({});
  let {
    Fajr: fajr,
    Dhuhr: dhhr,
    Asr: asr,
    Sunset: sunset,
    Isha: isha,
  } = timings;

  const isThereData = timings.Isha;

  function handleChangeCity(city) {
    setSelectedCity(city);
    setTimings({});
  }

  useEffect(() => {
    async function fetchTime() {
      try {
        const res = await fetch(
          ` http://api.aladhan.com/v1/timingsByCity?city=${selectedCity}&country=${country}&method=99`
        );
        const data = await res.json();
        if (data.status !== "OK") throw new Error("Something went wrong");

        setDisplayedCity(cityDetails[selectedCity].at(1));
        setTimings({ ...data.data.timings });
      } catch (err) {
        alert(err);
      }
    }
    fetchTime();
  }, [selectedCity, country]);

  return (
    <article className="app">
      <TimerHeader timerCity={displayedCity} isThereData={isThereData}>
        <Timer
          timings={[fajr, dhhr, asr, sunset, isha]}
          salats={{
            [fajr]: "الفجر",
            [dhhr]: "الظهر",
            [asr]: "العصر",
            [sunset]: "المغرب",
            [isha]: "العشاء",
          }}
          isThereData={isThereData}
        />
      </TimerHeader>

      <ul className="cards">
        <Card img={<img src="fajr-prayer.png" alt="fajr-prayer" />}>
          <p>الفجر</p>
          {timings.Isha ? <h2>{fajr}</h2> : <Loader design="load-time" />}
        </Card>

        <Card img={<img src="dhhr-prayer.png" alt="dhhr-prayer" />}>
          <p>الظهر</p>
          {isThereData ? <h2>{dhhr}</h2> : <Loader design="load-time" />}
        </Card>

        <Card img={<img src="asr-prayer.png" alt="asr-prayer" />}>
          <p>العصر</p>
          {isThereData ? <h2>{asr}</h2> : <Loader design="load-time" />}
        </Card>

        <Card img={<img src="sunset-prayer.png" alt="sunset-prayer" />}>
          <p>المغرب</p>
          {isThereData ? <h2>{sunset}</h2> : <Loader design="load-time" />}
        </Card>

        <Card img={<img src="night-prayer.png" alt="night-prayer" />}>
          <p>العشاء</p>
          <h2>{isha}</h2>
          {isThereData ? <h2>{isha}</h2> : <Loader design="load-time" />}
        </Card>
      </ul>

      <SelectCity city={selectedCity} onChangeCity={handleChangeCity} />
    </article>
  );
}

function TimerHeader({ timerCity, children, isThereData, isLoading }) {
  const [date, setDate] = useState(() => formatDate(new Date()));
  const [hours, setHours] = useState(() => new Date().getHours());
  const [minutes, setMinutes] = useState(() => new Date().getMinutes());

  useEffect(() => {
    setTimeout(
      () => setMinutes(() => new Date().getMinutes()),
      calcSeconds() * 1000
    );
  }, [minutes]);

  useEffect(() => {
    setTimeout(
      () => setHours(() => new Date().getHours()),
      calcMinutes() * 1000
    );
  }, [hours]);

  useEffect(() => {
    setTimeout(() => setDate(() => formatDate(new Date())), calcHours() * 1000);
  }, [date]);

  return (
    <header className="time-details">
      <div className="city-and-date">
        <p>
          {date} | {hours}:{minutes < 10 ? `0${minutes}` : minutes}
        </p>

        {/* <h2>{isThereData ? !isLoading? timerCity : <Loader design="load-city" />}</h2> */}
        {isThereData ? <h2>{timerCity}</h2> : <Loader design="load-city" />}
      </div>
      {children}
    </header>
  );
}

function Card({ img, children }) {
  return (
    <li className="card">
      <div className="card-img">{img}</div>
      <div className="card-content">{children}</div>
    </li>
  );
}

function SelectCity({ city, onChangeCity }) {
  return (
    <select value={city} onChange={(e) => onChangeCity(e.target.value)}>
      <option value={"Makkah"}>مكة المكرمة</option>
      <option value={"Algeria"}>الجزائر</option>
      <option value={"Madina"}>المدينة المنورة</option>
    </select>
  );
}

function Timer({ timings, salats, isThereData }) {
  const [seconds, setSeconds] = useState(0);
  const [remainingTime, setRemainingTime] = useState([0, 0]);
  const [hour, minute] = remainingTime;
  const [salat, setSalat] = useState("");

  useEffect(() => {
    if (!isThereData) return;
    const time = new Date();
    const { nextTiming, timeKey } = setNextTiming(timings);

    setTimeout(() => {
      setSeconds((sec) => 59 - time.getSeconds());
      setSalat(salats[timeKey]);
      setRemainingTime(() => getRemainingTime(nextTiming));
    }, 1000);
  }, [seconds, remainingTime, timings, salats, isThereData]);

  return (
    <div className="time-left">
      <p>متبقي حتى صلاة {salat}</p>
      {isThereData ? (
        <h2>
          {seconds < 10 ? "0" + seconds : seconds} :{" "}
          {minute < 10 ? "0" + minute : minute} :{" "}
          {hour < 10 ? "0" + hour : hour}
        </h2>
      ) : (
        <h2>00 : 00 : 00</h2>
      )}
    </div>
  );
}

function Loader({ design }) {
  return <div className={design}></div>;
}

// ///////////////////////
// Functions used
function formatDate(date) {
  return Intl.DateTimeFormat("ar-qr", {
    dateStyle: "long",
  }).format(date);
}

function calcHours() {
  return (
    ((24 - new Date().getHours()) * 60 - new Date().getMinutes()) * 60 -
    new Date().getSeconds()
  );
}

function calcMinutes() {
  return (60 - new Date().getMinutes()) * 60 - new Date().getSeconds();
}

function calcSeconds() {
  return 60 - new Date().getSeconds();
}

function setNextTiming(timings) {
  const time = new Date();

  const filteredTimings = timings.filter(
    (val) =>
      +val?.split(":").at(0) > time.getHours() ||
      (+val?.split(":").at(0) === time.getHours() &&
        +val?.split(":").at(1) > time.getMinutes())
  );

  if (filteredTimings.length === 0) {
    const nextTiming = timings
      .at(0)
      ?.split(":")
      .map((val) => +val);

    return { nextTiming, timeKey: timings.at(0) };
  }

  const nextTiming = filteredTimings
    .at(0)
    ?.split(":")
    .map((val) => +val);

  return { nextTiming, timeKey: filteredTimings.at(0) };
}

function getRemainingTime(nextTiming) {
  if (!nextTiming) return [0, 0];

  const [h, m] = nextTiming;
  const currentTime = new Date();
  const nextTime = new Date();
  nextTime.setHours(h < currentTime.getHours() ? h + 24 : h, m, 0);

  const timing = nextTime.getTime() - currentTime.getTime();

  const hours = Math.floor(timing / (1000 * 60 * 60));
  const minutes = Math.floor((timing % (1000 * 60 * 60)) / (1000 * 60));
  // console.log(timing / 1000);

  return [hours, minutes];
}
