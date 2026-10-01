from sqlalchemy.orm import Session

from app.services.event_rule_service import is_event_rule_enabled
from app.services.state_transition import detect_state_change


def detect_geofence_event(
    db: Session,
    geofence_id: int,
    previous_state: str,
    current_state: str,
) -> str | None:

    # Check whether the device changed its geofence state.
    transition_event = detect_state_change(
        previous_state=previous_state,
        current_state=current_state,
    )

    # ENTER or EXIT
    if transition_event is not None:
        if is_event_rule_enabled(
            db=db,
            geofence_id=geofence_id,
            event_type=transition_event,
        ):
            return transition_event

        return None

    # No state change.
    # Do not create repeated INSIDE or OUTSIDE events.
    return None