(ns parser.core
  (:require [clojure.string] [clojure.edn :as edn]))

(defn str->state
  [str]
  {:line 0 :col 0 :lines (clojure.string/split-lines str)})

(defn curr_char
  [{line :line col :col lines :lines}]
  (let [current_line (get lines line)
        current_char (get current_line col)]
    (cond
      current_char current_char
      current_line \newline
      :else nil)))

(defn next_char
  [{line :line col :col lines :lines}]
  (let [current_line (get lines line)]
    (if
     (> (inc col) (count current_line))
      {:line (inc line) :col 0 :lines lines}
      {:line line :col (inc col) :lines lines})))

(defn success
  [result remaining]
  {:success true :input remaining :result result})

(defn failure
  [msg input]
  {:success false :message msg :input input})

(defn and_then
  ([ps] (reduce and_then ps))
  ([p1 p2] (partial and_then p1 p2))
  ([p1 p2 input]
   (let [result1 (p1 input)]
     (if (:success result1)
       (let [result2 (p2 result1)]
         (if (:success result2)
           (success [(:result result1) (:result result2)] (:input result2))
           (failure (:message result2) (:input result2))))
       result1))))

(defn or_else
  ([ps] (reduce or_else ps))
  ([p1 p2] (partial or_else p1 p2))
  ([p1 p2 input]
   (let [result1 (p1 input)]
     (if (:success result1)
       result1
       (p2 input)))))

(defn satisfy
  ([label predicate] (partial satisfy label predicate))
  ([label predicate {xs :input}]
   (let [next (curr_char xs) remaining (next_char xs)]
     (cond
       (nil? next) (failure (str "Error parsing " label "; Unexpected end of input") xs)
       (predicate next) (success next remaining)
       :else (failure (str "Error parsing " label "; Unexpected " next) xs)))))

(defn label
  ([l p] (partial label l p))
  ([l p input]
   (let [result (p input)]
     (if (:success result)
       result
       (assoc result :message (str "Error parsing " l))))))

(defn parse_char
  [c]
  (satisfy c (partial = c)))

(defn run [p input] (p {:input (str->state input)}))

(defn any_of
  [str]
  (or_else (into [] (map parse_char) str)))

(defn string
  [str]
  (label str (and_then (into [] (map parse_char) str))))

(defn char_range
  [start end]
  (map char (range (int start) (inc (int end)))))

(defn map_p
  ([f] (partial map_p f))
  ([f parser] (partial map_p f parser))
  ([f parser input]
   (update (parser input) :result f)))

(defn many
  ([parser] (partial many parser))
  ([parser input]
   (let [result (parser input)]
     (if (:success result)
       (let [next (many parser result)]
         (success (cons (:result result) (:result next)) (:input next)))
       (success [] (:input input))))))

(defn many1
  ([parser] (partial many1 parser))
  ([parser input]
   (map_p flatten (and_then parser (many parser)) input)))

(defn opt
  ([parser] (partial opt parser))
  ([parser input]
   (let [result (parser input)]
     (if (:success result)
       result
       (success nil (:input result))))))

(defn keep_first
  [fst snd]
  (map_p first (and_then fst snd)))

(defn keep_second
  [fst snd]
  (map_p second (and_then fst snd)))

(defn between
  [open close body]
  (keep_second open (keep_first body close)))

(defn sep_by
  ([separator parser]
   (many (keep_first parser separator))))

(def stringify (comp clojure.string/join flatten))

(defn char_in_range
  ([begin end] (partial char_in_range begin end))
  ([begin end c]
   (and (<= (int begin) (int c)) (>= (int end) (int c)))))

(def digit (satisfy "digit" (char_in_range \0 \9)))

(def whitespace (label "whitespace" (any_of [\space \tab \newline])))

(def lowercase (satisfy "lowercase" (char_in_range \a \z)))

(def uppercase (satisfy "uppercase" (char_in_range \A \Z)))

(defn parse_sign
  [[sign body]]
  (if sign (cons sign body) body))

(def parse_int
  (map_p
   (comp edn/read-string stringify parse_sign)
   (label "int" (and_then (opt (parse_char \-)) (many1 digit)))))

(def parse_float
  (map_p
   (comp edn/read-string stringify parse_sign)
   (label "float" (and_then [(opt (parse_char \-)) (many1 digit) (parse_char \.) (many1 digit)]))))

(defn error_msg
  [{{line :line col :col lines :lines :as input} :input msg :message}]
  (clojure.string/join \newline
   [(str "Line " (inc line) ", Col " (inc col) ": " msg)
    (get lines line)
    (str (clojure.string/join (repeat col \space)) \^ " unexpected " (curr_char input))]))

(defn print_result
  [{success :success :as result}]
  (if success
    (println (:result result))
    (println (error_msg result))))