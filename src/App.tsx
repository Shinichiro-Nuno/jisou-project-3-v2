import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase-client";

function LearningRecord() {
  type Record = {
    id: number;
    title: string;
    time: number;
  };

  const [title, setTitle] = useState("");
  const [time, setTime] = useState(0);
  const [records, setRecords] = useState<Record[]>([]);
  const [isInput, setIsInput] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const onClickSave = useCallback(
    async (title: string, time: number) => {
      if (title && time) {
        const { data, error } = await supabase
          .from("study-record")
          .insert({ title, time })
          .select();

        if (error) {
          console.error("データ登録エラー:", error.message);
          return;
        }

        if (data && data.length > 0) {
          console.log(data);
          const insertedRecord = data[0];

          const newRecords = [...records, insertedRecord];
          setRecords(newRecords);
          setTitle("");
          setTime(0);
          setIsInput(true);
        }
      } else {
        setIsInput(false);
      }
    },
    [records]
  );

  const onClickDelete = useCallback(
    async (recordId: number, index: number) => {
      if (recordId) {
        const { error } = await supabase
          .from("study-record")
          .delete()
          .eq("id", recordId);

        if (error) {
          console.error("データ削除エラー:", error.message);
          return;
        }

        const newRecords = [...records];
        newRecords.splice(index, 1);
        setRecords(newRecords);
      }
    },
    [records]
  );

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("study-record")
        .select("id, title, time");

      if (error) {
        console.error("データ取得エラー:", error.message);
      } else if (data && data.length > 0) {
        setRecords(data);
      }

      setIsLoading(false);
    };

    fetchRecords();
  }, []);

  const totalTime = records.reduce((sum, record) => sum + record.time, 0);

  return (
    <>
      <h1>学習記録一覧</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <p>学習内容</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        ></input>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <p>学習時間</p>
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
        ></input>
      </div>
      <p>{`入力されている学習内容：${title}`}</p>
      <p>{`入力されている時間：${time}`}</p>
      <button onClick={() => onClickSave(title, time)}>登録</button>
      {!isInput && <p>入力されていない項目があります</p>}
      <ul>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          records.map((record, index) => (
            <li key={index}>
              {`${record.title} ${record.time}時間`}
              <button
                onClick={() => onClickDelete(record.id, index)}
                style={{ marginLeft: "8px", marginBottom: "8px" }}
              >
                削除
              </button>
            </li>
          ))
        )}
      </ul>
      <p>{`合計時間：${totalTime} / 1000 (h)`}</p>
    </>
  );
}

export default LearningRecord;
