from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin, get_current_user
from app.db.database import get_db
from app.models.geofence import Geofence
from app.models.geofence_point import GeofencePoint
from app.models.user import User
from app.schemas.geofence import (
    GeofenceCreate,
    GeofencePointResponse,
    GeofenceResponse,
    GeofenceUpdate,
)
from app.services.audit_service import create_audit_log


router = APIRouter(
    prefix="/geofences",
    tags=["Geofences"],
)


@router.post(
    "/",
    response_model=GeofenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_geofence(
    geofence_data: GeofenceCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    geofence = Geofence(
        name=geofence_data.name,
        description=geofence_data.description,
        geofence_type=geofence_data.geofence_type,
        center_latitude=geofence_data.center_latitude,
        center_longitude=geofence_data.center_longitude,
        radius=geofence_data.radius,
        is_active=True,
    )

    db.add(geofence)
    db.flush()

    if geofence_data.geofence_type == "POLYGON":
        for point in geofence_data.points:
            geofence_point = GeofencePoint(
                geofence_id=geofence.id,
                latitude=point.latitude,
                longitude=point.longitude,
                point_order=point.point_order,
            )
            db.add(geofence_point)

    db.commit()
    db.refresh(geofence)

    create_audit_log(
        db=db,
        user_id=current_admin.id,
        action="CREATE_GEOFENCE",
        entity_type="GEOFENCE",
        entity_id=geofence.id,
        description=f"Created geofence '{geofence.name}'",
    )

    points = (
        db.query(GeofencePoint)
        .filter(GeofencePoint.geofence_id == geofence.id)
        .order_by(GeofencePoint.point_order)
        .all()
    )

    response = GeofenceResponse.model_validate(geofence)

    response.points = [
        GeofencePointResponse.model_validate(point)
        for point in points
    ]

    return response


@router.get(
    "/",
    response_model=list[GeofenceResponse],
)
def get_geofences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    geofences = (
        db.query(Geofence)
        .order_by(Geofence.id)
        .all()
    )

    result = []

    for geofence in geofences:
        points = (
            db.query(GeofencePoint)
            .filter(GeofencePoint.geofence_id == geofence.id)
            .order_by(GeofencePoint.point_order)
            .all()
        )

        response = GeofenceResponse.model_validate(geofence)

        response.points = [
            GeofencePointResponse.model_validate(point)
            for point in points
        ]

        result.append(response)

    return result


@router.get(
    "/{geofence_id}",
    response_model=GeofenceResponse,
)
def get_geofence(
    geofence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    geofence = (
        db.query(Geofence)
        .filter(Geofence.id == geofence_id)
        .first()
    )

    if not geofence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence not found",
        )

    points = (
        db.query(GeofencePoint)
        .filter(GeofencePoint.geofence_id == geofence.id)
        .order_by(GeofencePoint.point_order)
        .all()
    )

    response = GeofenceResponse.model_validate(geofence)

    response.points = [
        GeofencePointResponse.model_validate(point)
        for point in points
    ]

    return response


@router.put(
    "/{geofence_id}",
    response_model=GeofenceResponse,
)
def update_geofence(
    geofence_id: int,
    geofence_data: GeofenceUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    geofence = (
        db.query(Geofence)
        .filter(Geofence.id == geofence_id)
        .first()
    )

    if not geofence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence not found",
        )

    if geofence_data.name is not None:
        geofence.name = geofence_data.name

    if geofence_data.description is not None:
        geofence.description = geofence_data.description

    if geofence_data.is_active is not None:
        geofence.is_active = geofence_data.is_active

    db.commit()
    db.refresh(geofence)

    create_audit_log(
        db=db,
        user_id=current_admin.id,
        action="UPDATE_GEOFENCE",
        entity_type="GEOFENCE",
        entity_id=geofence.id,
        description=f"Updated geofence '{geofence.name}'",
    )

    points = (
        db.query(GeofencePoint)
        .filter(GeofencePoint.geofence_id == geofence.id)
        .order_by(GeofencePoint.point_order)
        .all()
    )

    response = GeofenceResponse.model_validate(geofence)

    response.points = [
        GeofencePointResponse.model_validate(point)
        for point in points
    ]

    return response


@router.delete(
    "/{geofence_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_geofence(
    geofence_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    geofence = (
        db.query(Geofence)
        .filter(Geofence.id == geofence_id)
        .first()
    )

    if not geofence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Geofence not found",
        )

    geofence_name = geofence.name
    geofence_id_value = geofence.id

    create_audit_log(
        db=db,
        user_id=current_admin.id,
        action="DELETE_GEOFENCE",
        entity_type="GEOFENCE",
        entity_id=geofence_id_value,
        description=f"Deleted geofence '{geofence_name}'",
    )

    db.delete(geofence)
    db.commit()

    return None