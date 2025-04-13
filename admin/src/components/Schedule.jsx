import { useEffect } from "react";
import { Calendar } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import "./styles/calendar.css";

const Schedule = () => {
  useEffect(() => {
    //Date for the calendar events (dummy data)
    var date = new Date();
    var d = date.getDate(),
      m = date.getMonth(),
      y = date.getFullYear();

    // const containerEl = document.getElementById("external-events");
    const calendarEl = document.getElementById("calendar");
    // const checkbox = document.getElementById("drop-remove");

    const calendar = new Calendar(calendarEl, {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      editable: true,
      droppable: true,
      themeSystem: "bootstrap",
      events: [
        {
          title: "All Day Event",
          start: new Date(y, m, 1),
          backgroundColor: "#f56954", //red
          borderColor: "#f56954", //red
          allDay: true,
        },
        {
          title: "Long Event",
          start: new Date(y, m, d - 5),
          end: new Date(y, m, d - 2),
          backgroundColor: "#f39c12", //yellow
          borderColor: "#f39c12", //yellow
        },
        {
          title: "Meeting",
          start: new Date(y, m, d, 10, 30),
          allDay: false,
          backgroundColor: "#0073b7", //Blue
          borderColor: "#0073b7", //Blue
        },
        {
          title: "Lunch",
          start: new Date(y, m, d, 13, 0),
          end: new Date(y, m, d, 14, 0),
          allDay: false,
          backgroundColor: "#00c0ef", //Info (aqua)
          borderColor: "#00c0ef", //Info (aqua)
        },
        {
          title: "Birthday Party",
          start: new Date(y, m, d + 1, 19, 0),
          end: new Date(y, m, d + 1, 22, 30),
          allDay: false,
          backgroundColor: "#00a65a", //Success (green)
          borderColor: "#00a65a", //Success (green)
        },
        {
          title: "Click for Google",
          start: new Date(y, m, 28),
          end: new Date(y, m, 29),
          url: "https://www.google.com/",
          backgroundColor: "#3c8dbc", //Primary (light-blue)
          borderColor: "#3c8dbc", //Primary (light-blue)
        },
      ],
    });

    calendar.render();
  }, []);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Service Calendar</h1>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-9">
              <div className="card card-primary">
                <div className="card-body p-0">
                  {/* THE CALENDAR */}
                  <div id="calendar" />
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
            <div className="col-md-3 text-center">
              <button
                type="button"
                className="btn btn-primary col-8 mb-2"
                data-toggle="modal"
                data-target="#exampleModalCenter"
              >
                Add new event
              </button>

              <button className="btn btn-warning col-8 mb-2">
                Update event
              </button>
              <button className="btn btn-danger col-8 mb-2">
                Delete event
              </button>
            </div>
          </div>
        </div>

        <div>
          {/* Modal add new*/}
          <div
            className="modal fade"
            id="exampleModalCenter"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="exampleModalCenterTitle"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLongTitle">
                    Add new event
                  </h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label
                        htmlFor="recipient-name"
                        className="col-form-label"
                      >
                        Event title:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="recipient-name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message-text" className="col-form-label">
                        Description:
                      </label>
                      <textarea
                        className="form-control"
                        id="message-text"
                        defaultValue={""}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message-text" className="col-form-label">
                        Start date:
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="recipient-name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date and time:</label>
                      <div
                        className="input-group date"
                        id="reservationdatetime"
                        data-target-input="nearest"
                      >
                        <input
                          type="text"
                          className="form-control datetimepicker-input"
                          data-target="#reservationdatetime"
                        />
                        <div
                          className="input-group-append"
                          data-target="#reservationdatetime"
                          data-toggle="datetimepicker"
                        >
                          <div className="input-group-text">
                            <i className="fa fa-calendar" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message-text" className="col-form-label">
                        End date:
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="recipient-name"
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Schedule;
