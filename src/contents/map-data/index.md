---
title: Map Data
published: true
category: Map
subtitle: Map에서 다루는 data
date: 2023-12-01
---
## data

- raster data
    
    GIS에서 레스터 데이터는 지표면의 객체를 표현하는 셀들의 매트릭스를 말한다. 일반적인 레스터 데이터는 항공사진, 위성 이미지, 표고 또는 기온과 같은 모델 데이터 등의 데이터를 포함한다.
    
    픽셀 해당도 및 x/y 좌표로 지오코딩 되어있다.
    
    레스터 데이터를 저장하는데에는 GeoPackage 포맷 또는 GeoTiff 포맷을 사용할 수 있다.
    
- vector data
    
    포맷 사양으로 GeoPackage, shapfile, PostGIS, SpatiaLite 등등
    
    feature 유형으로 CircularString, CompoundCurve, CurvePolygon, MultiCurve, MultiSurface 등등 있다.
    

## format

- GeoPackage
    
    플랫폼에 상관없이 사용할 수 있다. SQLite DB 컨테이너로 실행되고, 레스터 벡터 데이터 둘 다 저장할 수 있다.
    
    저장 가능한 것
    
    - vector feature
    - raster map 및 이미지 타일 매트릭스 집합
    - 확장자
    - 비공간 데이터

[OGC GeoPackage](https://www.geopackage.org/)

- shapefile
    
    GeoPackage 및 SpatiaLite에 비해 제한이 존재하더라고 가장 자주 이용되는 벡터 포맷 중 하나
    
    데이터 셋(필수)
    
    - .shp: feature shape을 담고 있는 파일
    - .dbf: dBase 서식으로 속성을 담고 있는 파일
    - .shx: 인덱스 파일
- text file
    
- PostGIS 레이어
    
- SpatiaLite 레이어
    

## Tile

> 동일한 크기의 사각형으로 구성된 2차원 격자로 각각 이미지를 표시할 수 있다.

타일의 종류

- Raster tile: 이미지 파일로 이미 렌더링된 상태
    
    - ex) 비트맵
- Vector tile: point나 line, polygon과 같은 지리적 벡터 데이터를 가지고 있는 타일 데이터
    
    - ex) GeoJSON, shapfile, KML 등
    
    벡터 타일 종류
    
    - MBTiles
        
        : 하나 이상의 벡터 파일을 맵 렌더링과 소용량 데이터에 최적화된 데이터 포맷인 **벡터 타일**로 내보낸다.
        
        즉각적인 활용 및 전송을 위해 SQLite DB에 타일화된 맵 데이터를 저장하기 위한 사양
        
        이름이 tileset이라고도 한다.(?)
        
    - XYZ
        
        확대/축소 수준에 대응하는 하위 폴더들에 저장된 벡터 타일(`.pbf`) 파일들의 서로 다른 하위 집합들을 담고 있는 폴더
