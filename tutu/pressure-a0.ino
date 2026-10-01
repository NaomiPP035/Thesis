// Upload to an Arduino-compatible board. A0 must receive a valid divided voltage.
void setup() { Serial.begin(9600); }
void loop() {
  Serial.println(analogRead(A0));
  delay(20);
}

