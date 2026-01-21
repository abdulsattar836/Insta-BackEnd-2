const socketIo = require("socket.io");
// models
const User = require("../Model/vendor_model");

let io; // Declare a variable to store the 'io' object

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket) => {
    console.log("User connected ", socket.id);

    // Listen for user or admin authentication event
    socket.on("connectUser", async (userId) => {
      try {
        if (userId) {
          const Model = User; // Determine model based on isAdmin flag
          let entity = await Model.findOne({ _id: userId });

          if (entity) {
            // Disconnect all previous sockets associated with the same entity
            const previousSockets = await io.in(userId).allSockets();
            for (const previousSocketId of previousSockets) {
              if (previousSocketId !== socket.id) {
                io.sockets.sockets.get(previousSocketId).disconnect(true);
              }
            }

            // Update entity model with socket ID
            if (entity.socketId) {
              entity.socketId.push(socket.id);
              await entity.save();
            } else {
              entity = await Model.findOneAndUpdate(
                {
                  _id: userId,
                },
                {
                  socketId: socket.id,
                },
                {
                  new: true,
                }
              );
              console.log("entity", entity.socketId);
            }

            console.log(
              `Socket ID ${socket.id} associated with ${"user"} ${
                entity.name
              } connected`
            );

            const connectedEntity = {
              userId: entity._id,
              status: "online",
            };

            // find all entities (users or admins) with socketId array not empty
            const entities = await Model.find({ socketId: { $ne: [] } });
            const socketIds = entities.flatMap((e) => e.socketId);

            // emit the connected entity to all connected entities
            io.to(socketIds).emit("entityConnected", connectedEntity);
          }
        }
      } catch (err) {
        console.log({ err });
      }
    });

    // Disconnect event
    socket.on("disconnect", async () => {
      console.log("User disconnected");

      const entities = [User]; // Iterate over both users and admins

      for (const Model of entities) {
        let entity = await Model.find({ socketId: socket.id });
        if (entity.length > 0) {
          await Promise.all(
            entity.map(async (e) => {
              // pull socket.id
              e.socketId.pull(socket.id);
              await e.save();

              const disconnectedEntity = {
                userId: e._id,
                status: "offline",
              };

              // find all entities with socketId array not empty
              const otherEntities = await Model.find({ socketId: { $ne: [] } });
              const socketIds = otherEntities.flatMap((e) => e.socketId);

              // emit the disconnected entity to all entities
              io.to(socketIds).emit("entityDisconnected", disconnectedEntity);

              console.log(
                `Socket ID ${
                  socket.id
                } disassociated from ${Model.modelName.toLowerCase()} ${e.name}`
              );
            })
          );
        }
      }
    });

    socket.on("newMessage", async (data) => {
      try {
        io.to(data.socketId).emit("newMessage", data.newChat);
      } catch (error) {
        console.log(error);
        socket.emit("error", "An error occurred");
      }
    });

    // Clean up socket IDs for disconnected users/admins
    let entities = await User.find({ socketId: { $exists: true, $ne: [] } });
    if (entities.length) {
      await Promise.all(
        entities.map(async (entity) => {
          const entityInstance = await entity.constructor.findById(entity._id);
          await Promise.all(
            entity.socketId.map(async (socketId) => {
              if (!io.sockets.sockets.get(socketId)) {
                entityInstance.socketId.pull(socketId);
              }
            })
          );
          await entityInstance.save();
        })
      );
    }
  });

  return io;
}

// Export a function that returns the 'io' object when called
module.exports = {
  initializeSocket,
  getIo: () => io, // Return the 'io' object
};
