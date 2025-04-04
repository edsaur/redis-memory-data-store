export default function handleStringCommands(input, socket, db, state) {
    let { step, tempKey, tempStart, tempOffset } = state;
  
    if (step === "set_key") {
      state.tempKey = input;
      socket.write("Enter value: ");
      state.step = "set_value";
      return;
    } else if (step === "set_value") {
      db.string.set(state.tempKey, input);
      socket.write(`+OK (Set ${state.tempKey} = ${input})\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "get_key") {
      const value = db.string.get(input);
      socket.write(value !== null ? `+${value}\r\n` : "$-1\r\n");
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "append_key") {
      state.tempKey = input;
      socket.write("Enter value to append: ");
      state.step = "append_value";
      return;
    } else if (step === "append_value") {
      db.string.append(state.tempKey, input);
      socket.write(`+OK (Appended ${input} to ${state.tempKey})\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "strlen_key") {
      const length = db.string.strlen(input);
      socket.write(`:${length}\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "incr_key") {
      const newValue = db.string.incr(input);
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "decr_key") {
      const newValue = db.string.decr(input);
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "incrby_key") {
      state.tempKey = input;
      socket.write("Enter increment value: ");
      state.step = "incrby_value";
      return;
    } else if (step === "incrby_value") {
      const newValue = db.string.incrBy(state.tempKey, Number(input));
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "decrby_key") {
      state.tempKey = input;
      socket.write("Enter decrement value: ");
      state.step = "decrby_value";
      return;
    } else if (step === "decrby_value") {
      const newValue = db.string.decrBy(state.tempKey, Number(input));
      socket.write(`:${newValue}\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "getrange_key") {
      state.tempKey = input;
      socket.write("Enter start index: ");
      state.step = "getrange_start";
      return;
    } else if (step === "getrange_start") {
      state.tempStart = Number(input);
      socket.write("Enter end index: ");
      state.step = "getrange_end";
      return;
    } else if (step === "getrange_end") {
      const value = db.string.getRange(state.tempKey, state.tempStart, Number(input));
      socket.write(`+${value}\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    } else if (step === "setrange_key") {
      state.tempKey = input;
      socket.write("Enter offset: ");
      state.step = "setrange_offset";
      return;
    } else if (step === "setrange_offset") {
      state.tempOffset = Number(input);
      socket.write("Enter new value: ");
      state.step = "setrange_value";
      return;
    } else if (step === "setrange_value") {
      const newLength = db.string.setRange(state.tempKey, state.tempOffset, input);
      socket.write(`:${newLength}\r\n`);
      socket.write(displayMenu());
      state.step = null;
      return;
    }
  };
  